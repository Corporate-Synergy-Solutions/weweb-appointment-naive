<template>
    <Appointment
        :key="updateComponent"
        :isLoading="isLoading"
        :timeMax="timeMax || content.timeMax"
        :timeMin="timeMin || content.timeMin"
        :duration="duration || content.duration"
        :busyTime="content.busyTime"
        :hideBusyTime="content.hideBusyTime"
        :startTime="0"
        :endTime="24"
        :timezone="timezone"
        :availability="availability"
        :configId="configId"
        :userName="userName"
        :title="title"
        :description="description"
        :cancellationPolicy="cancellationPolicy"
        :photoUrl="photoUrl"
        :minTimeInAdvance="minTimeInAdvance"
        :maxTimeInAdvance="maxTimeInAdvance"
        :bufferTimeBefore="bufferTimeBefore"
        :bookingForm="bookingForm"
        @submit="
            e => {
                $emit('trigger-event', {
                    name: 'form:submit',
                    event: e,
                });
                onSubmit(e);
            }
        "
    />
</template>

<script setup>
import { watch, ref, onMounted } from 'vue';
import Appointment from './naive/Appointment.vue';
const props = defineProps({
    content: { type: Object, required: true },
});

const isLoading = ref(true);
const timeMax = ref('');
const timeMin = ref('');
const duration = ref(30);
const userName = ref('');
const title = ref('');
const cancellationPolicy = ref('');
const description = ref('');
const photoUrl = ref('');
const timezone = ref('');
const availability = ref({});
const configId = ref('');
const minTimeInAdvance = ref(0);
const maxTimeInAdvance = ref(0);
const bufferTimeBefore = ref(0);
const bookingForm = ref([]);

const updateComponent = ref(1);
watch(
    () => props.content,
    () => (updateComponent.value += 1),
    { deep: true }
);

onMounted(() => {
    fetchConfig();
});

async function fetchConfig() {
    const id = window.location.href
        .split('/')
        .filter(e => e)
        .pop();
    const url = `https://xdqr-gfnh-b7n9.n7c.xano.io/api:6hwjHZP_/consultations/${id}`;
    try {
        isLoading.value = true;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        let res = await response.json();
        timeMin.value = res.data.schedulingWindow.startDate;
        timeMax.value = res.data.schedulingWindow.endDate;
        photoUrl.value = res.data.bookingPage.photoUrl;
        userName.value = res.data.bookingPage.name;
        duration.value = res.data.appointmentDuration;
        title.value = res.data.title;
        description.value = res.data.bookingPage.description;
        cancellationPolicy.value = res.data.bookingPage.cancellationPolicy;
        timezone.value = res.data.timezone;
        minTimeInAdvance.value = res.data.useMinTimeInAdvance ? res.data.minTimeInAdvance : 0;
        maxTimeInAdvance.value = res.data.useMaxTimeInAdvance ? res.data.maxTimeInAdvance : 9999;
        const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = res.data.generalAvailability;
        availability.value = { monday, tuesday, wednesday, thursday, friday, saturday, sunday };
        configId.value = id;
        bufferTimeBefore.value = res.data.bookedAppointmentSettings.useBufferTimeBefore
            ? res.data.bookedAppointmentSettings.bufferTimeBefore
            : 0;
        bookingForm.value = res.data.bookingPage.bookingForm.fields;
        updateComponent.value += 1;
    } catch (error) {
        console.error(error.message);
    } finally {
        isLoading.value = false;
    }
}

function onSubmit(val) {
    wwLib.wwVariable.updateValue(props.content.idComponentBind, val);
}
</script>
