<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dbService } from '../services/db.service';
import type { DailyLog } from '../services/db.service';
import { useAuthStore } from '../stores/authStore';
import { getNow } from '../services/time.service';

const authStore = useAuthStore();
const history = ref<{date: string, log?: DailyLog}[]>([]);

const getColorClass = (log?: DailyLog) => {
  if (!log) return 'bg-slate-800'; 
  if (log.status === 'completed') return 'bg-green-500';
  if (log.status === 'saved') return 'bg-blue-400';
  return 'bg-slate-800'; // Failed
};

onMounted(async () => {
   const now = getNow();
   const logicalOffset = now.getHours() < 4 ? -1 : 0;
   
   const dates: string[] = [];
   for (let i = 27; i >= 0; i--) {
     const d = new Date(now);
     d.setDate(d.getDate() + logicalOffset - i);
     
     // To keep consistent local timezone YYYY-MM-DD
     const localStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
     dates.push(localStr);
   }

   const pastLogs = await dbService.getPastDays(authStore.deviceId, dates);
   
   const logMap = new Map(pastLogs.map(l => [l.logicalDate, l]));
   history.value = dates.map(date => ({
     date,
     log: logMap.get(date)
   }));
});
</script>

<template>
  <div class="grid grid-cols-7 gap-[6px]">
    <div v-for="day in history" :key="day.date" 
         class="aspect-square rounded-[4px] transition-colors shadow-[inset_0_-1px_0_rgba(255,255,255,0.1)]"
         :class="getColorClass(day.log)"
         :title="day.date + (day.log ? ` - ${day.log.completionPercentage}%` : '')">
    </div>
  </div>
</template>
