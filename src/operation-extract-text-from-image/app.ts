import { defineOperationApp } from '@directus/extensions-sdk';

export default defineOperationApp({
	id: 'extract-text-from-image',
	name: 'Extract text from image',
	icon: 'image_search',
	description: 'Detect text in an image with AI',
	overview: ({ api }) => [
		{
			label: 'API',
			text: api ?? 'amazon-rekognition',
		},
	],
	options: [
		{
			field: 'api',
			name: 'API',
			type: 'string',
			schema: {
				default_value: 'amazon-rekognition',
			},
			meta: {
				interface: 'select-dropdown',
				width: 'half',
				options: {
					choices: [
						{
							text: 'Amazon Rekognition',
							value: 'amazon-rekognition',
						},
						// {
						// 	text: 'Azure Vision AI',
						// 	value: 'azure-vision-ai',
						// }
					],
				},
			},
		},
		{
			field: 'field',
			name: '$t:field',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'half',
				options: {
					iconRight: 'key',
					font: 'monospace',
					placeholder: '{{$trigger.key}}'
				},
			},
			schema: {
				default_value: '{{$trigger.key}}',
			},
		},
	],
});
