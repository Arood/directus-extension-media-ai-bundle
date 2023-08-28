import { defineOperationApp } from '@directus/extensions-sdk';

export default defineOperationApp({
	id: 'describe-image',
	name: 'Describe image',
	icon: 'image_search',
	description: 'Describe the contents of an image',
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
							text: 'AltText.ai',
							value: 'alttext.ai',
						},
						{
							text: 'Amazon Rekognition',
							value: 'amazon-rekognition',
						},
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
