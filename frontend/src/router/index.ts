import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import SettingsView from '../views/SettingsView.vue';
import OnboardingView from '../views/OnboardingView.vue';
import TimerView from '../views/TimerView.vue';
import { useRoutineStore } from '../stores/routineStore';
import { useAuthStore } from '../stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresRoutine: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresRoutine: true }
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: OnboardingView,
    },
    {
      path: '/timer/:id',
      name: 'timer',
      component: TimerView,
      meta: { requiresRoutine: true }
    }
  ]
});

router.beforeEach(async (to, from) => {
  const routineStore = useRoutineStore();
  const logStore = useLogStore();
  const authStore = useAuthStore();
  
  if (!authStore.isInitialized) {
      await authStore.initAuth();
      // After sync is complete, force reload local state from DB 
      // to ensure manual SQL updates are reflected in UI stores.
      if (authStore.isAuthenticated) {
        await routineStore.loadRoutine(authStore.deviceId);
        if (routineStore.activeRoutine) {
          await logStore.loadTodayLog(authStore.deviceId, routineStore.activeRoutine);
        }
      }
  }

  if (!routineStore.activeRoutine) {
      await routineStore.loadRoutine(authStore.deviceId);
  }

  const hasRoutine = !!routineStore.activeRoutine;
  
  if (to.meta.requiresRoutine && !hasRoutine) {
    return { name: 'onboarding' };
  } else if (to.name === 'onboarding' && hasRoutine) {
    return { name: 'dashboard' };
  }
  return true;
});

export default router;
