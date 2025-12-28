import toast from 'react-hot-toast';

const baseOptions = {
  duration: 5000,
  position: 'bottom-left',
};

/**
 * Shared copy for common flows. Reuse so wording stays consistent across pages.
 */
export const toastMessages = {
  contact: {
    success: 'Message sent! I will get back to you soon.',
    error: 'Failed to send message. Please try again later.',
  },
  donate: {
    success: 'Thank you for your donation!',
    error: 'Donation failed. Please retry.',
  },
  addInteraction: {
    success: 'Interaction Video Submitted Successfully!',
    info: 'Please select both champion abilities before uploading.',
    error: 'Could not submit interaction.',
  },
  video: {
    like_success: 'Video Liked Successfully!',
    unlike_success: 'Video Unliked Successfully!',
    like_error: 'Could not like video.',
  },
  rating:
  {
    champion: {
      success: 'Champion Rating Submitted Successfully!',
      error: 'Could not submit champion rating.',
    },
    skin: {
      success: 'Skin Rating Submitted Successfully!',
      error: 'Could not submit skin rating.',
    },
    failed_to_load: 'Failed to load your rating.',
    has_missing: 'Please provide a rating for all fields (1-10).',
  },
  comment: {
    success: 'Comment Submitted Successfully!',
    error: 'Could not submit comment.',
  },
  reply: {
    success: 'Reply Submitted Successfully!',
    error: 'Could not submit reply.',
  },
  signIn: {
    success: 'Signed in successfully!',
    info: 'Please sign in to continue.',
    error: 'Could not sign in.',
  }
};

const createToast = (fn) => (message, options) =>
  fn(message, { ...baseOptions, ...options });

export const useToast = () => {
  const success = createToast(toast.success);
  const error = createToast(toast.error);
  const info = createToast(toast.info);
  const loading = createToast(toast.loading);

  const promise = (promiseOrFn, messages, options) =>
    toast.promise(
      typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn,
      {
        loading: messages?.loading || 'Working...',
        success: messages?.success || 'Done!',
        error: messages?.error || 'Something went wrong',
      },
      { ...baseOptions, ...options },
    );

  const dismiss = (id) => toast.dismiss(id);
  const dismissAll = () => toast.dismiss();

  return { success, error, info, loading, promise, dismiss, dismissAll };
};

