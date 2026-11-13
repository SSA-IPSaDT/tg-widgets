import { Alert, defineStaticWidgetScreen, h, WidgetLayout } from '../../src';

/**
 * State contract for the alerts widget (static screen, no mutable state).
 */
export type AlertsState = Record<string, never>;

/**
 * Alerts screen showcasing informative callout statuses and alerts.
 * Defines a completely static widget screen:
 * - 0 bytes client JS runtime
 * - 0 round-trip server queries (allow_queries: false)
 * - 0 storage allocation
 * - Pure HTML/CSS layout
 *
 * @example
 * await ctx.widgets.reply('alerts', { props: {} });
 */
export const alertsScreen = defineStaticWidgetScreen({
    id: 'alerts',
    component: () => (
        <WidgetLayout gap={8} fullWidth padding="8px 10px">
            <Alert
                variant="info"
                title="Information"
                description="Widgets adapt dynamically to the user's active Telegram theme palette."
            />
            <Alert
                variant="success"
                title="Successfully Saved"
                description="All state changes have been synchronized with the cloud."
            />
            <Alert
                variant="warning"
                title="Size Limit Notice"
                description="Deflate-compressed payload is limited to 4096 bytes under Bot API 10.4."
            />
            <Alert
                variant="destructive"
                title="Authorization Required"
                description="This action cannot be completed without verified permissions."
            />
        </WidgetLayout>
    ),
});
