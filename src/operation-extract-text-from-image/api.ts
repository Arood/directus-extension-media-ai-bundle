import { defineOperationApi } from '@directus/extensions-sdk';
import { RekognitionClient, DetectTextCommand } from '@aws-sdk/client-rekognition'
import { optionToObject } from '@directus/utils';
import { bufferFromStream } from '../utils';

type Options = {
	api: string;
	field: string;
};

export default defineOperationApi<Options>({
	id: 'extract-text-from-image',
	handler: async ({ field, api }, { data, env, database, getSchema, services }) => {
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
			throw Error("Could not find any files");
		}
		if (asset.file.type.indexOf('image') === -1) {
			throw Error("This operation only works for images");
		}
		var buffer = await bufferFromStream(asset.stream);
		if (api == 'azure-vision-ai') {
			// TODO: Add support for Azure Vision AI (and possibly other services)
			return null;
		} else {
			// Amazon Rekognition support
			if (!env['AWS_ACCESS_KEY_ID'] || !env['AWS_SECRET_ACCESS_KEY'] || !env['AWS_REGION']) {
				throw Error("Missing required environment variables");
			}
			const client = new RekognitionClient({
				region: env['AWS_REGION']
			})
			const command = new DetectTextCommand({
				Image: {
					Bytes: buffer
				}
			})
			const result = await client.send(command);
			const lines = result.TextDetections?.filter((item) => item.Type == 'LINE')?.map((item) => ({
				text: item.DetectedText,
				confidence: item.Confidence,
				geometry: {
					top: item.Geometry?.BoundingBox?.Top,
					left: item.Geometry?.BoundingBox?.Left,
					height: item.Geometry?.BoundingBox?.Height,
					width: item.Geometry?.BoundingBox?.Width
				}
			}));
			return {
				lines,
				full_text: lines?.map(item => item.text)?.join("\n"),
				$raw: result
			}
		}
	},
});
