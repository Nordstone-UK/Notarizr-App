const ACTIVE_PLAN_STATUSES = new Set(['trialing', 'active', 'grace_period']);
const PRO_SUBSCRIPTION_TYPES = new Set([
  'monthly',
  'yearly',
  'pro',
  'pro_monthly',
  'pro_yearly',
]);

export const isAgentPro = user => {
  const plan = user?.agentPlan || {};
  if (plan?.tier === 'pro' && ACTIVE_PLAN_STATUSES.has(plan?.status)) {
    return true;
  }
  return (
    Boolean(user?.isSubscribed) ||
    PRO_SUBSCRIPTION_TYPES.has(String(user?.subscriptionType || ''))
  );
};

export const agentPlanId = user => {
  if (!isAgentPro(user)) {
    return 'free';
  }
  const subscriptionType = String(user?.subscriptionType || '');
  if (subscriptionType === 'yearly' || subscriptionType === 'pro_yearly') {
    return 'pro_annual';
  }
  return 'pro_monthly';
};

export const agentTier = user => (isAgentPro(user) ? 'pro' : 'free');

export const agentPlanLabel = user => {
  if (!isAgentPro(user)) {
    return 'Free Agent';
  }
  return agentPlanId(user) === 'pro_annual'
    ? 'Agent Pro Annual'
    : 'Agent Pro';
};

export const agentPlanFeatures = user => {
  const pro = isAgentPro(user);
  return {
    openCalls: pro,
    customPricing: pro,
    privateBilling: pro,
    brandedInvites: pro,
    sessionTemplates: pro,
    prioritySupport: pro,
  };
};
