import { auth } from "@/lib/auth";
import { listNotificationsForUser } from "@/services/notificationService";
import NotificationList from "@/components/notifications/NotificationList";

export default async function NotificationsPage() {
  const session = await auth();
  const { notifications, unreadCount } = await listNotificationsForUser(
    session.user.id,
    { limit: 50 }
  );

  return (
    <div className="w-full max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Notifications
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {unreadCount} unread
        </p>
      </div>
      <NotificationList notifications={JSON.parse(JSON.stringify(notifications))} />
    </div>
  );
}
