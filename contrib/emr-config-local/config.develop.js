const config = {
    clientId: 'web-amplify',

    wearablesAccessConsentCodingSystem: 'https://fhir.emr.beda.software/CodeSystem/consent-subject',

    tier: 'staging',
    baseURL: 'https://staging-aidbox.moxie-link.com',
    whisperApiUrl: 'https://whisper.staging.nexushealthproject.com',
    sdcIdeUrl: 'https://sdc.beda.software',
    aiQuestionnaireBuilderUrl: 'https://builder.emr.beda.software',

    sdcBackendUrl: null,
    webSentryDSN: null,
    mobileSentryDSN: null,
    jitsiMeetServer: 'video.emr.beda.software/',
    wearablesDataStreamService: 'https://ingest.emr.beda.software/api/v1',
    metriportIdentifierSystem: 'https://api.sandbox.metriport.com',
    aiAssistantServiceUrl: 'https://scribe.emr.beda.software',
};

export { config as default };
