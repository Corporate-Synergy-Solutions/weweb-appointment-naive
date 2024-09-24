<template>
    <n-card class="appointment">
        <n-flex>
            <n-date-picker v-model:value="date" :actions="[]" :is-date-disabled="dateDisabled" panel type="date" />
            <n-divider vertical class="divider" />
            <n-flex vertical class="time">
                <n-radio-group v-model:value="time" name="radio-button-group">
                    <n-radio-button v-for="a in arrTime" :key="a" :value="a" :label="a" />
                </n-radio-group>
            </n-flex>
        </n-flex>
    </n-card>
</template>

<script setup>
import { NDatePicker, NCard, NDivider, NFlex, NRadioGroup, NRadioButton } from 'naive-ui';
import { ref, onMounted, computed, watch } from 'vue';
import { addMinutes, format } from 'date-fns';

const props = defineProps({
    timeMin: { type: String, required: true },
    timeMax: { type: String, required: true },
});
const emit = defineEmits(['selected']);

const time = ref();
const date = ref();
const timeMin = '2024-09-01T05:00:00.000Z';
const timeMax = '2024-09-10T05:00:00.000Z';
const duration = 30;
const arrTime = ref([]);

function initArrTime() {
    var d = new Date();
    d.setHours(8, 0, 0, 0);
    while (d.getHours() <= 22) {
        d = addMinutes(d, duration);
        console.log(d.getHours());
        arrTime.value.push(format(d, 'HH:mm'));
    }
}

const getSelectedTime = computed(() =>
    date.value && time.value ? `${format(date.value, 'yyyy:MM:dd')}T${time.value}:00` : ''
);

watch(getSelectedTime, val => {
    if (val) emit('selected', val);
});

onMounted(() => {
    initArrTime();
});

function dateDisabled(ts) {
    const d = new Date(ts);
    const date = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();
    const currentDate = new Date();
    const timeMaxD = props.timeMax
        ? new Date(props.timeMax)
        : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const timeMinD = props.timeMin
        ? new Date(props.timeMin)
        : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    return (
        date < timeMinD.getDate() ||
        date > timeMaxD.getDate() ||
        (month !== timeMinD.getMonth() && month !== timeMaxD.getMonth()) ||
        (year !== timeMinD.getFullYear() && year !== timeMaxD.getFullYear())
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
