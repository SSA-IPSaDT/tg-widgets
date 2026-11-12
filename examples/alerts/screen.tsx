import {
    Alert,
    defineWidgetScreen,
    h,
    WidgetLayout,
} from '../../src';

/**
 * State contract for the alerts widget.
 */
export type AlertsState = Record<string, never>;

/**
 * Alerts screen showcasing informative callout statuses and alerts.
 * Utilizes official Lucide SVG icons and adaptive theme colors.
 *
 * @example
 * await ctx.widgets.reply('alerts', { props: {} });
 */
export const alertsScreen = defineWidgetScreen({
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
    initialState: () => ({}),
});
