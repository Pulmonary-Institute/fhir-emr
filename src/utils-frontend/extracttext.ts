import axios from 'axios';
import config from '@beda.software/emr-config';
const whisperApiUrl = config.whisperApiUrl;

import { generateDownloadUrl } from '../services/file-upload';

// Extract text from audio function
export async function ExtractTextFromAudio(questionData: any): Promise<any> {
    try {
        if (!Array.isArray(questionData) || questionData.length === 0) return 'No valid data';

        const url = questionData?.[0]?.value?.Attachment?.url ?? null;
        if (!url) return 'Invalid URL';

        // Fetch the download URL and audio transcription in parallel
        const response = await generateDownloadUrl(url);
        if (response.status !== 'Success') return 'Error fetching audio';

        const audioUrl = response?.data?.downloadUrl;
        return await AudioToText(audioUrl);
    } catch (error) {
        console.error('Error processing audio:', error);
        return 'Error in transcription';
    }
}

// Function to transcribe audio using Whisper API
async function AudioToText(audioUrl: string): Promise<any> {
    try {
        // Fetch audio file and prepare for Whisper API in parallel
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error('Failed to fetch audio file');

        const audioBuffer = await response.arrayBuffer();
        const file = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });

        // Create FormData
        const formData = new FormData();
        formData.append('audio', file);

        // Whisper API URL
        const whisperUrl = `${whisperApiUrl}/transcribe`;

        // Send to Whisper API with optimized headers
        const transcribeResponse = await axios.post(whisperUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        console.log('whisper api response=>', transcribeResponse);

        return transcribeResponse.data.transcription || 'No text extracted';
    } catch (error) {
        console.error('Error during transcription:', error);
        return 'Transcription error';
    }
}
