import { defineOperationApi } from '@directus/extensions-sdk';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition'
import { optionToObject } from '@directus/utils';
import { bufferFromStream } from '../utils';

const axios = require("axios")

type Options = {
	api: string;
	field: string;
};

export default defineOperationApi<Options>({
	id: 'describe-image',
	handler: async ({ field, api }, { data, env, logger, accountability, database, getSchema, services }) => {
		const key:string = field ?? optionToObject(data['$trigger'] as any).key;
		if (!key) {
			throw Error("Key is empty");
		}
		const schema = await getSchema({ database });
		const { AssetsService } = services;
		const service = new AssetsService({
			schema
		});
		const asset = await service.getAsset(key, { transformationParams: {}, acceptFormat: null }); // TODO: Allow users to set transformation for better performance
		if (!asset) {
			throw Error("Could not find the asset");
		}
		if (asset.file.type.indexOf('image') === -1) {
			throw Error("This operation only works for images");
		}
		var buffer = await bufferFromStream(asset.stream);
		if (api == 'alttext.ai') {
			// AltText.ai support
			if (!env['ALTTEXT_AI_API_KEY']) {
				throw Error("Missing required environment variables");
			}
			const request = await axios.post("https://alttext.ai/api/v1/images", JSON.stringify({
				image: {
					raw: buffer.toString('base64'),
					asset_id: asset.file.id
				}
			}), {
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": env['ALTTEXT_AI_API_KEY']
				}
			});
			if (request.data?.alt_text) {
				return {
					description: request.data?.alt_text,
					$raw: request.data
				}
			} else {
				throw Error(request.data.errors);
			}
		} else {
			// Amazon Rekognition support
			if (!env['AWS_ACCESS_KEY_ID'] || !env['AWS_SECRET_ACCESS_KEY'] || !env['AWS_REGION']) {
				throw Error("Missing required environment variables");
			}
			const client = new RekognitionClient({
				region: env['AWS_REGION']
			})
			const command = new DetectLabelsCommand({
				Image: {
					Bytes: buffer
				},
				MaxLabels: 10,
				MinConfidence: 80
			})
			const result = await client.send(command);
			const description = result.Labels?.map((item) => item.Name).join(", ");
			return {
				description,
				$raw: result
			}
		}
	},
});
