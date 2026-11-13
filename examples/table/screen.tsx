import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    defineWidgetScreen,
    h,
    LucideIcon,
    LucideIcons,
    Script,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
    WidgetActionContext,
    WidgetLayout,
} from '../../src';

/**
 * State contract for the table widget.
 */
export type TableState = Record<string, never>;

/**
 * Client-side script handling receipt download haptic feedback and action trigger.
 */
const tableClientScript = () => {
    const widget = window.TelegramWidget;
    const downloadButton = document.getElementById('btn-download');

    downloadButton?.addEventListener('click', () => {
        widget?.HapticFeedback?.notificationOccurred?.('success');
        widget?.openLink?.('https://google.com');
        widget?.request?.('downloadReceipt');
    });
};

/**
 * Native data table screen demonstrating Table, TableHeader, TableBody, TableFooter,
 * cell alignment, and download action triggers.
 *
 * @example
 * ```tsx
 * import { tableScreen } from './table/screen';
 *
 * await bot.api.sendMessage(chatId, 'Receipt', {
 *   reply_markup: {
 *     inline_keyboard: [[{
 *       text: 'View Receipt',
 *       callback_data: 'open_table'
 *     }]]
 *   }
 * });
 * ```
 */
export const tableScreen = defineWidgetScreen({
    id: 'table',
    component: () => (
        <WidgetLayout fullWidth padding="6px 8px">
            <Card fullWidth style={{ position: 'relative' }}>
                <CardHeader>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <CardTitle>Receipt #4096</CardTitle>
                        <Badge
                            variant="success"
                            icon={LucideIcon({
                                icon: LucideIcons.Check,
                                size: 15,
                            })}
                        />
                    </div>
                    <CardDescription>
                        Native table layout with system theme border separators
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead align="center">Qty</TableHead>
                                <TableHead align="right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Margherita Pizza</TableCell>
                                <TableCell align="center">2</TableCell>
                                <TableCell align="right">$18.00</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Citrus Lemonade</TableCell>
                                <TableCell align="center">1</TableCell>
                                <TableCell align="right">$4.50</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Tartar Sauce</TableCell>
                                <TableCell align="center">1</TableCell>
                                <TableCell align="right">$1.50</TableCell>
                            </TableRow>
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colspan={2}>Total Due</TableCell>
                                <TableCell align="right">$24.00</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Button
                        id="btn-download"
                        variant="outline"
                        fullWidth
                        size="md"
                        icon={LucideIcon({
                            icon: LucideIcons.Download,
                            size: 14,
                            style: { marginRight: 6 },
                        })}
                    >
                        Download Receipt
                    </Button>
                </CardFooter>
            </Card>
            <Script fn={tableClientScript} />
        </WidgetLayout>
    ),
    initialState: () => ({}),
    actions: {
        downloadReceipt: async (ctx: WidgetActionContext<Record<string, unknown>>) => {
            return ctx.answer({
                text: '🧾 Receipt #4096 generated successfully',
                show_alert: false,
            });
        },
    },
});
