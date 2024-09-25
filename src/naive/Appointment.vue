<template>
    <n-card class="appointment">
        <n-flex>
            <n-date-picker v-model:value="date" :actions="[]" :is-date-disabled="dateDisabled" panel type="date" />
            <n-divider vertical class="divider" />
            <n-flex vertical class="time">
                <n-radio-group v-if="date" v-model:value="time" name="radio-button-group">
                    <template v-for="a in arrTime" :key="a">
                        <n-radio-button
                            v-if="hideBusyTime ? !timeDisabled(a) : true"
                            :value="a"
                            :label="a"
                            :disabled="timeDisabled(a)"
                        />
                    </template>
                </n-radio-group>
            </n-flex>
        </n-flex>
    </n-card>
</template>

<script setup>
import { TZDate } from '@date-fns/tz';
import { NDatePicker, NCard, NDivider, NFlex, NRadioGroup, NRadioButton } from 'naive-ui';
import { ref, onMounted, watch } from 'vue';
import { addMinutes, format, isWithinInterval } from 'date-fns';

const props = defineProps({
    timeMin: { type: [String, Number], default: '' },
    timeMax: { type: [String, Number], default: '' },
    duration: { type: [Number, String], default: 30 },
    hideBusyTime: { type: Boolean, default: false },
    busyTime: { type: [Array, String], default: () => [] },
    startTime: { type: Number, default: 9 },
    endTime: { type: Number, default: 17 },
});

const emit = defineEmits(['selected']);

const time = ref();
const date = ref();
const arrTime = ref([]);

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

watch(time, val => {
    emit('selected', getDateTimeLocalTimezone(val).toISOString());
});

onMounted(() => {
    initArrTime();
});

function dateDisabled(ts) {
    if (!props.timeMax || !props.timeMin) return false;
    const d = new Date(ts);
    const timeMaxD = new Date(props.timeMax);
    const timeMinD = new Date(props.timeMin);
    timeMinD.setDate(timeMinD.getDate() - 1);
    return !isWithinInterval(d, {
        start: timeMinD,
        end: timeMaxD,
    });
}

function timeDisabled(t) {
    if (!props.busyTime.length) return false;
    const d = getDateTimeLocalTimezone(t);

    return (
        props.busyTime.findIndex(e =>
            isWithinInterval(d, {
                start: new Date(e.start),
                end: new Date(e.end),
            })
        ) != -1
    );
}
</script>

<style lang="scss">
.appointment {
    .n-card {
        max-width: 500px;
    }
    .divider {
        height: 280px !important;
    }
    .time {
        flex-grow: 1;
        overflow-y: scroll;
        padding: 0px 4px;
    }
    .n-button {
        width: 100%;
    }
    .n-radio-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .n-radio-button {
        border: 1px solid var(--n-button-border-color);
        border-radius: var(--n-button-border-radius) !important;
        text-align: center;
    }
    .n-radio-button__state-border {
        border-radius: var(--n-button-border-radius) !important;
    }
    .n-radio__label {
        line-height: 32px;
    }
}
</style>
