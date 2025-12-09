import { useToast } from '../toast/useToast';

export default function ToastTest() {
  const { success, error, info, promise } = useToast();

  const triggerPromise = () =>
    promise(
      new Promise((resolve, reject) =>
        setTimeout(() => (Math.random() > 0.5 ? resolve() : reject()), 1200),
      ),
      {
        loading: 'Working...',
        success: 'All good!',
        error: 'Something went wrong',
      },
    );

  return (
    <div style={{ padding: '24px', display: 'grid', gap: '12px' }}>
      <h2>Toast Test</h2>
      <button onClick={() => success('Saved!')}>Success toast</button>
      <button onClick={() => error('Error toast!')}>Error toast</button>
      <button onClick={() => info('Info toast!')}>Info toast</button>
      <button onClick={triggerPromise}>Promise toast</button>
    </div>
  );
}

