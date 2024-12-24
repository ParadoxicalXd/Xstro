import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { createReadStream } from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { FileTypeFromBuffer } from 'xstro-utils';

/**
 * Enhances or filters images using the Vyro AI API.
 * @async
 * @param {Buffer|string} image - The image buffer or file path to process
 * @param {string} [filterType='enhance'] - The type of filter to apply ('enhance', 'recolor', or 'dehaze')
 * @returns {Promise<Buffer>} A buffer containing the processed image data
 * @throws {Error} If the API request fails
 */

export const remini = async (image, filterType) => {
	const availableFilters = ['enhance', 'recolor', 'dehaze'];
	const selectedFilter = availableFilters.includes(filterType)
		? filterType
		: availableFilters[0];
	const apiUrl = `https://inferenceengine.vyro.ai/${selectedFilter}`;

	const form = new FormData();
	form.append('model_version', 1);

	const imageBuffer = Buffer.isBuffer(image) ? image : readFileSync(image);
	form.append('image', imageBuffer, {
		filename: 'enhance_image_body.jpg',
		contentType: 'image/jpeg',
	});
	const response = await axios.post(apiUrl, form, {
		headers: {
			...form.getHeaders(),
			'User-Agent': 'okhttp/4.9.3',
			Connection: 'Keep-Alive',
			'Accept-Encoding': 'gzip',
		},
		responseType: 'arraybuffer',
	});
	return Buffer.from(response.data);
};

/**
 * Uploads a file to Catbox hosting service.
 * @async
 * @param {Buffer} mediaBuffer - The buffer containing the file data to upload
 * @returns {Promise<string>} The URL of the uploaded file
 * @throws {Error} If the file type cannot be determined or if the upload fails
 */
export const uploadFile = async mediaBuffer => {
	const fileType = await FileTypeFromBuffer(mediaBuffer);
	if (!fileType)
		throw new Error('Unable to determine the file type of the media.');
	const filename = `file.${fileType}`;
	const tempPath = path.join(process.cwd(), filename);
	writeFileSync(tempPath, mediaBuffer);

	const form = new FormData();
	form.append('fileToUpload', createReadStream(tempPath), {
		filename,
		contentType: fileType,
	});
	form.append('reqtype', 'fileupload');

	const response = await axios.post(
		'https://catbox.moe/user/api.php',
		form,
		{
			headers: form.getHeaders(),
		},
	);
	const url = response.data.trim();
	unlinkSync(tempPath);
	return url;
};

/**
 * Removes the background from an image using the remove.bg API
 * @param {Buffer} buffer - The input image buffer
 * @returns {Promise<Buffer>} A buffer containing the image with removed background
 * @throws {Error} If the API request fails
 * @async
 */
export async function removeBg(buffer) {
	const formData = new FormData();
	const type = await FileTypeFromBuffer(buffer);
	const inputPath = path.join(process.cwd(), `temp_image.${type}`);
	writeFileSync(inputPath, buffer);
	formData.append('size', 'auto');
	formData.append(
		'image_file',
		createReadStream(inputPath),
		path.basename(inputPath),
	);
	const { status, data } = await axios.post(
		'https://api.remove.bg/v1.0/removebg',
		formData,
		{
			responseType: 'arraybuffer',
			headers: {
				...formData.getHeaders(),
				'X-Api-Key': 'FjyTadatkyWixWGWUCUDTF7J',
			},
			encoding: null,
		},
	);
	unlinkSync(inputPath);
	return data;
}

/**
 * Searches and retrieves APK download information from Aptoide API
 * @param {string} query - The search query for the app
 * @returns {Promise<Object>} Object containing app details:
 * - img: App icon URL
 * - developer: Developer/store name
 * - appname: Application name
 * - link: APK file download path
 * @async
 */
export async function apkDl(query) {
	const res = await axios.get('http://ws75.aptoide.com/api/7/apps/search', {
		params: {
			query,
			limit: 1,
		},
	});
	const app = res.data.datalist.list[0];

	return {
		img: app.icon,
		developer: app.store.name,
		appname: app.name,
		link: app.file.path,
	};
}

/**
 * Uploads a file to Uguu.se hosting service
 * @param {(Buffer|string)} input - The file to upload, either as a Buffer or file path string
 * @returns {Promise<string>} A promise that resolves to the URL of the uploaded file
 * @throws {Error} Will throw an error if the input type is invalid or if the upload fails
 * @async
 */
export async function UguuUpload(input) {
	return new Promise(async (resolve, reject) => {
		const form = new FormData();
		let fileStream;

		if (Buffer.isBuffer(input)) {
			fileStream = input;
			form.append('files[]', fileStream, 'uploaded-file.jpg');
		} else if (typeof input === 'string') {
			fileStream = createReadStream(input);
			form.append('files[]', fileStream);
		} else {
			return reject(new Error('Invalid input type'));
		}

		try {
			const response = await axios({
				url: 'https://uguu.se/upload.php',
				method: 'POST',
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
					...form.getHeaders(),
				},
				data: form,
			});
			resolve(response.data.files[0].url);
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Scrapes Pinterest for images based on a search query.
 * @param {string} query - The search term to look for on Pinterest.
 * @returns {Promise<{status: number, url: string}>} A promise that resolves to an object containing:
 *   - status: HTTP status code (200 if successful)
 *   - url: URL of a randomly selected image from the search results
 * @throws {Error} If the Pinterest request fails
 */
export function pinterest(query) {
	return new Promise((resolve, reject) => {
		axios(
			`https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${query}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${query}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559`,
		)
			.then(data => {
				const random =
					data.data.resource_response.data.results[
						Math.floor(
							Math.random() *
								data.data.resource_response.data.results
									.length,
						)
					];
				var result = [];
				result = {
					status: 200,
					url: random.images.orig.url,
				};
				resolve(result);
			})
			.catch(reject);
	});
}
