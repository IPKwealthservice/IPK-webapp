/**
 * Follow-up Hook
 * Manages follow-up scheduling and state
 */

import { useMutation } from "@apollo/client";
import { UPDATE_NEXT_ACTION_DUE, CREATE_FOLLOW_UP_EVENT } from "@/components/sales/view_lead/gql/followUp.gql";
import type { FollowUpInput } from "@/components/sales/view_lead/interface/followUpTypes";

type FollowUpOptions = {
  onSuccess?: (nextActionDueAt: string) => void;
  onError?: (error: Error) => void;
};

export function useFollowUp(options?: FollowUpOptions) {
  const [mutUpdateNextAction, { loading: updatingNextAction }] = useMutation(UPDATE_NEXT_ACTION_DUE);
  const [mutCreateFollowUp, { loading: creatingFollowUp }] = useMutation(CREATE_FOLLOW_UP_EVENT);

  /**
   * Save follow-up action and update nextActionDueAt
   */
  const saveFollowUp = async (input: FollowUpInput) => {
    try {
      const result = await mutCreateFollowUp({
        variables: {
          input: {
            leadId: input.leadId,
            nextActionDueAt: input.nextActionDueAt,
            actionType: input.actionType || "CALL",
            description: input.description || null,
            priority: input.priority || "MEDIUM",
          },
        },
      });

      const nextActionDueAt = result.data?.createFollowUpEvent?.nextActionDueAt;
      if (nextActionDueAt) {
        options?.onSuccess?.(nextActionDueAt);
      }

      return result;
    } catch (err: any) {
      options?.onError?.(err);
      throw err;
    }
  };

  /**
   * Update only the nextActionDueAt date without creating event
   */
  const updateNextActionDue = async (leadId: string, nextActionDueAt: string) => {
    try {
      const result = await mutUpdateNextAction({
        variables: {
          input: { leadId, nextActionDueAt },
        },
      });

      const updatedDate = result.data?.updateNextActionDue?.nextActionDueAt;
      if (updatedDate) {
        options?.onSuccess?.(updatedDate);
      }

      return result;
    } catch (err: any) {
      options?.onError?.(err);
      throw err;
    }
  };

  return {
    saveFollowUp,
    updateNextActionDue,
    loading: updatingNextAction || creatingFollowUp,
  };
}
