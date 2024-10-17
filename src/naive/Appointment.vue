<template>
    <n-config-provider :theme-overrides="themeOverrides">
        <n-flex>
            <n-spin :show="isLoading || isLoadingSubmit" size="large">
                <n-flex class="appointment">
                    <div class="info">
                        <n-avatar
                            round
                            size="medium"
                            :src="photoUrl || 'error.png'"
                            fallback-src="https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg"
                        />
                        <p class="name">{{ userName }}</p>
                        <p class="title">{{ title }}</p>
                        <n-flex vertical>
                            <n-flex v-if="time && date" align="center">
                                <Calendar size="16" />
                                <p class="selected-datetime">
                                    {{
                                        time ? format(getDateTimeLocalTimezone(time), 'iiii, do MMMM yyyy K:mmaa') : ''
                                    }}
                                </p>
                            </n-flex>
                            <n-flex align="center">
                                <Hourglass size="16" />
                                <p>{{ duration }} minutes</p>
                            </n-flex>
                            <n-flex align="center">
                                <Text size="16" />
                                <p>{{ description }}</p>
                            </n-flex>
                            <n-flex align="center">
                                <CircleAlert size="16" />
                                <p>{{ cancellationPolicy }}</p>
                            </n-flex>
                        </n-flex>
                    </div>
                    <div v-if="step === 1">
                        <n-flex>
                            <div class="datepicker">
                                <p>Select date and time</p>
                                <n-date-picker
                                    v-model:value="date"
                                    @update:value="time = null"
                                    :actions="[]"
                                    :is-date-disabled="dateDisabled"
                                    panel
                                    type="date"
                                />
                            </div>
                            <template v-if="date">
                                <n-divider vertical class="divider" />
                                <n-flex vertical class="time">
                                    <n-radio-group v-if="date" v-model:value="time" name="radio-button-group">
                                        <template v-for="a in arrTime" :key="a">
                                            <n-radio-button
                                                v-if="hideBusyTime ? !timeDisabled(a) : true"
                                                :checked="time === a"
                                                :value="a"
                                                :label="format24To12(a)"
                                                :disabled="timeDisabled(a)"
                                            />
                                        </template>
                                    </n-radio-group>
                                </n-flex>
                            </template>
                        </n-flex>
                        <n-divider />
                        <n-flex>
                            <n-button
                                :disabled="!time || !date"
                                :style="'width: 140px; margin-left: auto;'"
                                type="primary"
                                @click="step = 2"
                            >
                                Next
                            </n-button>
                        </n-flex>
                    </div>
                    <div v-else-if="step === 2">
                        <n-flex>
                            <div :style="'min-height: 320px; min-width: 547px'">
                                <n-form ref="formRef" :model="form" :rules="rules">
                                    <n-form-item label="First name" path="firstName">
                                        <n-input v-model:value="form.firstName" placeholder="First name" />
                                    </n-form-item>
                                    <n-form-item label="Last name" path="lastName">
                                        <n-input v-model:value="form.lastName" placeholder="Last name" />
                                    </n-form-item>
                                    <n-form-item label="Email" path="email">
                                        <n-input type="email" v-model:value="form.email" placeholder="Email" />
                                    </n-form-item>
                                </n-form>
                            </div>
                        </n-flex>
                        <n-divider />
                        <n-flex>
                            <n-button :disabled="!time || !date" :style="'width: 140px;'" @click="step = 1">
                                Back
                            </n-button>
                            <n-button
                                :disabled="!time || !date"
                                :style="'width: 140px; margin-left: auto;'"
                                type="primary"
                                @click="handleValidateClick"
                            >
                                Submit
                            </n-button>
                        </n-flex>
                    </div>
                </n-flex>
            </n-spin>
        </n-flex>
    </n-config-provider>
</template>

<script setup>
import { Calendar, CircleAlert, Hourglass, Text } from 'lucide-vue-next';
import { TZDate } from '@date-fns/tz';
import {
    NDatePicker,
    NDivider,
    NFlex,
    NRadioGroup,
    NRadioButton,
    NAvatar,
    NButton,
    NSpin,
    NForm,
    NFormItem,
    NInput,
    NConfigProvider,
} from 'naive-ui';
import { ref, onBeforeMount } from 'vue';
import {
    addMinutes,
    format,
    isWithinInterval,
    isSunday,
    isTuesday,
    isWednesday,
    isThursday,
    isFriday,
    isSaturday,
    isMonday,
    getDay,
} from 'date-fns';

const props = defineProps({
    isLoading: { type: Boolean, default: false },
    timeMin: { type: [String, Number], required: true },
    timeMax: { type: [String, Number], required: true },
    duration: { type: [Number, String], default: 30 },
    hideBusyTime: { type: Boolean, default: false },
    busyTime: { type: [Array, String], default: () => [] },
    startTime: { type: Number, default: 9 },
    endTime: { type: Number, default: 17 },
    title: { type: String },
    description: { type: String },
    cancellationPolicy: { type: String },
    userName: { type: String },
    photoUrl: { type: String },
    timezone: { type: String },
    configId: { type: String },
    availability: {
        type: Object,
        default: () => {
            return {
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: [],
                sunday: [],
            };
        },
    },
});

/**
 * Use this for type hints under js file
 * @type import('naive-ui').GlobalThemeOverrides
 */
const themeOverrides = {
    common: {
        primaryColor: '#2a0066',
        primaryColorHover: '#3e0195',
        primaryColorPressed: '#3e0195',
        primaryColorSuppl: '#3e0195',
    },
};

const emit = defineEmits(['submit']);
const form = ref({
    firstName: '',
    lastName: '',
    email: '',
});

const rules = {
    firstName: {
        required: true,
        message: 'This field is required',
        trigger: 'blur',
    },
    lastName: {
        required: true,
        message: 'This field is required',
        trigger: 'blur',
    },
    email: [
        {
            required: true,
            message: 'This field is required',
            trigger: 'blur',
        },
        { validator: validateEmail, message: 'Email is not valid', trigger: 'input' },
    ],
};

function validateEmail(rule, value) {
    return /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
}

const isLoadingSubmit = ref(false);
const formRef = ref(null);
function handleValidateClick(e) {
    e.preventDefault();
    formRef.value?.validate(errors => {
        if (!errors) {
            emit('submit', {
                ...form.value,
                dateTime: getDateTimeLocalTimezone(time.value).toISOString(),
                configId: props.configId,
            });
            isLoadingSubmit.value = true;
        } else {
            console.log(errors);
        }
    });
}

const time = ref();
const date = ref();
const arrTime = ref([]);
const step = ref(1);
function initArrTime() {
    let d = new TZDate(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone);
    d.setHours(props.startTime, 0, 0, 0);
    arrTime.value.push(format(d, 'HH:mm'));
    while (d.getHours() + d.getMinutes() / 60 + props.duration / 60 < props.endTime) {
        d = addMinutes(d, props.duration);
        arrTime.value.push(format(d, 'HH:mm'));
    }
}

function getDateTimeLocalTimezone(time) {
    const t = time.split(':');
    const m = parseInt(t[0]) * 60 + parseInt(t[1]);
    const d = new TZDate(date.value, Intl.DateTimeFormat().resolvedOptions().timeZone);
    d.setHours(0, 0, 0, 0);
    d.setMinutes(m);
    return d;
}

function getDateTimeWithTimezone(time) {
    const t = time.split(':');
    const m = parseInt(t[0]) * 60 + parseInt(t[1]);
    const d = new TZDate(date.value, props.timezone);
    d.setHours(0, 0, 0, 0);
    d.setMinutes(m);
    return d;
}

const disabledDays = ref([]);

onBeforeMount(() => {
    checkDisabledDays();
    initArrTime();
});

function checkDisabledDays() {
    for (const property in props.availability) {
        if (!props.availability[property][0].start || !props.availability[property][0].end)
            disabledDays.value.push(property);
    }
}

function dateDisabled(ts) {
    if (!props.timeMax || !props.timeMin) return false;
    const d = new Date(ts);
    const timeMaxD = new TZDate(new Date(props.timeMax), props.timezone);
    const timeMinD = new TZDate(new Date(props.timeMin), props.timezone);
    timeMinD.setDate(timeMinD.getDate() - 1);
    return (
        dateDisabledByDay(d, disabledDays.value) ||
        !isWithinInterval(d, {
            start: timeMinD,
            end: timeMaxD,
        })
    );
}

function dateDisabledByDay(d, arr) {
    return (
        (arr.includes('monday') && isMonday(d)) ||
        (arr.includes('tuesday') && isTuesday(d)) ||
        (arr.includes('wednesday') && isWednesday(d)) ||
        (arr.includes('thursday') && isThursday(d)) ||
        (arr.includes('friday') && isFriday(d)) ||
        (arr.includes('saturday') && isSaturday(d)) ||
        (arr.includes('sunday') && isSunday(d))
    );
}

function format24To12(timeString) {
    const [hourString, minute] = timeString.split(':');
    const hour = +hourString % 24;
    return (hour % 12 || 12) + ':' + minute + (hour < 12 ? 'AM' : 'PM');
}

function timeDisabled(t) {
    const dayMap = {
        0: 'sunday',
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday',
    };
    const d = getDateTimeLocalTimezone(t);
    const dtz = getDateTimeWithTimezone(t);

    return (
        (props.busyTime.length &&
            props.busyTime.findIndex(e =>
                isWithinInterval(d, {
                    start: new Date(e.start),
                    end: new Date(e.end),
                })
            ) != -1) ||
        props.availability[dayMap[getDay(dtz)]].findIndex(
            e =>
                e.start &&
                e.end &&
                !isWithinInterval(dtz, {
                    start: getDateTimeWithTimezone(e.start),
                    end: getDateTimeWithTimezone(e.end),
                })
        ) != -1
    );
}
</script>

<style lang="scss">
.appointment {
    border: 1px solid lightgray;
    padding: 16px;
    border-radius: 8px;
    overflow: hidden;

    .info {
        min-width: 280px;
        min-height: 435px;
        background-color: rgb(243, 243, 243);
        padding: 16px;
        margin: -16px 16px -16px -16px;
        p {
            margin: 0;
        }

        .selected-datetime {
            font-weight: 600;
        }

        .name {
            color: rgb(88, 88, 88);
            font-size: 12px;
            margin-bottom: 20px;
        }
        .title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 20px;
        }
    }
    .datepicker {
        p {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 14px 20px;
        }
    }

    .n-card {
        min-width: 400px;
    }
    .divider {
        height: 320px !important;
    }
    .time {
        flex-grow: 1;
        overflow-y: scroll;
        padding: 0px 4px;
        &::-webkit-scrollbar {
            width: 8px;
        }
        &::-webkit-scrollbar-thumb {
            background-color: rgb(209 213 219);
            border-radius: 9999px;
        }
        &::-webkit-scrollbar-track {
            background-color: white;
            border-radius: 9999px;
        }
    }
    .n-button {
        width: 100%;
    }
    .n-radio-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 200px;
    }
    .n-radio-button {
        border: 1px solid var(--n-button-border-color);
        border-radius: var(--n-button-border-radius) !important;
        text-align: center;
    }

    .n-radio-button--checked {
        border: 1px solid var(--n-button-border-color-active) !important;
    }

    .n-radio-button__state-border {
        border-radius: var(--n-button-border-radius) !important;
    }

    .n-radio__label {
        line-height: 32px;
    }
}
</style>
