import React, { useCallback, useEffect } from 'react';

import { initializeMessenger } from '~/core/messengers';
import { useNotificationWindowStore } from '~/core/state/notificationWindow';
import { usePendingRequestStore } from '~/core/state/requests';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { RequestAccounts } from './RequestAccounts';
import { SendTransaction } from './SendTransaction';
import { SignMessage } from './SignMessage';

const backgroundMessenger = initializeMessenger({ connect: 'background' });

export const ApproveAppRequest = () => {
  const { pendingRequests, removePendingRequest } = usePendingRequestStore();
  const { notificationWindows } = useNotificationWindowStore();
  const isExternalPopup = window.location.href.includes('tabId=');
  // If we're on an external popup, we only want to show the request that were sent from that tab
  // otherwise we show all the requests in the extension popup
  const filteredRequests = isExternalPopup
    ? pendingRequests.filter((request) => {
        return (
          request.meta?.sender?.tab?.id ===
          Number(window.location.search.split('tabId=')[1])
        );
      })
    : pendingRequests;

  const pendingRequest = filteredRequests?.[0];

  const navigate = useRainbowNavigate();

  useEffect(() => {
    if (pendingRequests.length < 1) {
      navigate(ROUTES.HOME);
    }
  }, [pendingRequests?.length, navigate]);

  const handleRequestAction = useCallback(() => {
    removePendingRequest(pendingRequest?.id);
    const notificationWindow =
      notificationWindows?.[
        Number(pendingRequest?.meta?.sender?.tab?.id)?.toString()
      ];
    if (pendingRequests.length <= 1 && notificationWindow?.id) {
      setTimeout(() => {
        notificationWindow?.id && chrome.windows.remove(notificationWindow?.id);
        navigate(ROUTES.HOME);
      }, 50);
    }
  }, [
    removePendingRequest,
    pendingRequest?.id,
    pendingRequest?.meta?.sender?.tab?.id,
    notificationWindows,
    pendingRequests.length,
    navigate,
  ]);

  const approveRequest = useCallback(
    async (payload?: unknown) => {
      backgroundMessenger.send(`message:${pendingRequest?.id}`, payload);
      handleRequestAction();
    },
    [handleRequestAction, pendingRequest?.id],
  );

  const rejectRequest = useCallback(() => {
    backgroundMessenger.send(`message:${pendingRequest?.id}`, null);
    handleRequestAction();
  }, [handleRequestAction, pendingRequest?.id]);

  switch (pendingRequest?.method) {
    case 'eth_requestAccounts':
      return (
        <RequestAccounts
          approveRequest={approveRequest}
          rejectRequest={rejectRequest}
          request={pendingRequest}
        />
      );
    case 'eth_sign':
    case 'personal_sign':
    case 'eth_signTypedData':
    case 'eth_signTypedData_v3':
    case 'eth_signTypedData_v4':
      return (
        <SignMessage
          approveRequest={approveRequest}
          rejectRequest={rejectRequest}
          request={pendingRequest}
        />
      );
    case 'eth_sendTransaction':
      return (
        <SendTransaction
          approveRequest={approveRequest}
          rejectRequest={rejectRequest}
          request={pendingRequest}
        />
      );
    default:
      return null;
  }
};
