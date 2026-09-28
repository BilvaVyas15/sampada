export const LIFECYCLE_STAGES = [
  { stageNo: 1, name: 'Proposed', phase: 'Planning & Approval' },
  { stageNo: 2, name: 'Administrative Approval', phase: 'Planning & Approval' },
  { stageNo: 3, name: 'Technical Sanction', phase: 'Planning & Approval' },
  { stageNo: 4, name: 'Tender / Work Order', phase: 'Planning & Approval' },
  { stageNo: 5, name: 'Under Construction', phase: 'Construction' },
  { stageNo: 6, name: 'Completed', phase: 'Construction' },
  { stageNo: 7, name: 'Handed Over', phase: 'Handover' },
  { stageNo: 8, name: 'Operational', phase: 'In Service' },
  { stageNo: 9, name: 'Under Maintenance', phase: 'In Service' },
  { stageNo: 10, name: 'Needs Attention', phase: 'In Service' },
  { stageNo: 11, name: 'Retired', phase: 'End of Life' },
] as const;

export type StageNo = (typeof LIFECYCLE_STAGES)[number]['stageNo'];
export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number];

export function getLifecycleStage(stageNo: number): LifecycleStage | undefined {
  return LIFECYCLE_STAGES.find((stage) => stage.stageNo === stageNo);
}

export function getAllowedNextStages(stageNo: number): StageNo[] {
  if (stageNo >= 1 && stageNo <= 7) return [(stageNo + 1) as StageNo];
  if (stageNo === 8) return [9, 10, 11];
  if (stageNo === 9) return [8, 10, 11];
  if (stageNo === 10) return [8, 9, 11];
  return [];
}

export function getDeliveryProgress(stageNo: number): { stage: number; percent: number } {
  const stage = Math.min(Math.max(stageNo, 1), 8);
  return { stage, percent: Math.round((stage / 8) * 100) };
}