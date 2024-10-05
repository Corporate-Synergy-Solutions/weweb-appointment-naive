<template>
    <Appointment
        :key="updateComponent"
        :timeMax="content.timeMax"
        :timeMin="content.timeMin"
        :duration="content.duration"
        :busyTime="content.busyTime"
        :hideBusyTime="content.hideBusyTime"
        :startTime="content.startTime"
        :endTime="content.endTime"
        @selected="
            e => {
                $emit('trigger-event', {
                    name: 'event:selected',
                    event: {
                        dateTime: e,
                    },
                });
                onUpdateDate(e);
            }
        "
    />
</template>

<script setup>
import { watch, ref } from 'vue';
import Appointment from './naive/Appointment.vue';
const props = defineProps({
    content: { type: Object, required: true },
});

const updateComponent = ref(1);
watch(
    () => props.content,
    () => (updateComponent.value += 1),
    { deep: true }
);

function onUpdateDate(val) {
    wwLib.wwVariable.updateValue(props.content.idComponentBind, val);
}
</script>
