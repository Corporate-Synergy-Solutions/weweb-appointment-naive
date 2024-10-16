export default {
    editor: {
        label: {
            en: 'Naive appointment',
        },
    },
    properties: {
        idComponentBind: {
            label: {
                en: 'Form output variable',
            },
            type: 'Text',
            defaultValue: '',
            bindable: true,
        },
        timeMax: {
            label: {
                en: 'Maximum date',
            },
            type: 'Text',
            defaultValue: '',
            bindable: true,
        },
        timeMin: {
            label: {
                en: 'Minimum date',
            },
            type: 'Text',
            defaultValue: '',
            bindable: true,
        },
        duration: {
            label: {
                en: 'Duration',
            },
            type: 'Number',
            options: {
                min: 10,
                max: 120,
                step: 10,
            },
            defaultValue: 60,
            bindable: true,
        },
        startTime: {
            label: {
                en: 'Start time',
            },
            type: 'Number',
            options: {
                min: 1,
                max: 24,
                step: 1,
            },
            defaultValue: 9,
            bindable: true,
        },
        endTime: {
            label: {
                en: 'End time',
            },
            type: 'Number',
            options: {
                min: 1,
                max: 24,
                step: 1,
            },
            defaultValue: 17,
            bindable: true,
        },
        busyTime: {
            label: {
                en: 'Busy time',
            },
            type: 'Text',
            defaultValue: '',
            bindingValidation: {
                type: 'Array',
                tooltip: 'e.g. [{ start: `2024-09-03T10:00:00+07:00`, end: `2024-09-03T12:00:00+07:00` }]',
            },
            bindable: true,
        },
        hideBusyTime: {
            label: {
                en: 'Hide busy time',
            },
            type: 'OnOff',
            bindable: true,
            defaultValue: false,
        },
    },
    triggerEvents: [
        {
            name: 'form:submit',
            label: { en: 'On form submitted' },
            event: {},
        },
    ],
};
