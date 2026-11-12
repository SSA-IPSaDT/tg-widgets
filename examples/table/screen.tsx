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

const tableClientScript = () => {
    const W = (window as unknown as { TelegramWidget?: any }).TelegramWidget;
    const btn = document.getElementById('btn-download');
    const toast = document.getElementById('receipt-toast');

    btn?.addEventListener('click', () => {
        W?.HapticFeedback?.notificationOccurred?.('success');
        if (toast) {
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3500);
        }
        W?.request?.('downloadReceipt');
    });
};

/**
 * Экран нативной таблицы с чеком заказа и скачиванием квитанции
 */
export const tableScreen = defineWidgetScreen({
    id: 'table',
    component: () => (
        <WidgetLayout expand>
            <Card fullWidth style={{ position: 'relative' }}>
                <CardHeader>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <CardTitle>Чек заказа #4096</CardTitle>
                        <Badge variant="success">Оплачено</Badge>
                    </div>
                    <CardDescription>
                        Пример нативной таблицы с системными границами ячеек
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Позиция</TableHead>
                                <TableHead align="center">Кол-во</TableHead>
                                <TableHead align="right">Сумма</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Пицца Маргарита</TableCell>
                                <TableCell align="center">2</TableCell>
                                <TableCell align="right">18.00 $</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Лимонад цитрусовый</TableCell>
                                <TableCell align="center">1</TableCell>
                                <TableCell align="right">4.50 $</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Соус тар-тар</TableCell>
                                <TableCell align="center">1</TableCell>
                                <TableCell align="right">1.50 $</TableCell>
                            </TableRow>
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colspan={2}>Итого к оплате</TableCell>
                                <TableCell align="right">24.00 $</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Button
                        id="btn-download"
                        variant="outline"
                        fullWidth
                        size="sm"
                        icon={LucideIcon({
                            icon: LucideIcons.Download,
                            size: 14,
                            style: { marginRight: 6 },
                        })}
                    >
                        Скачать квитанцию
                    </Button>
                </CardFooter>

                {/* Уведомление о скачивании прямо внутри виджета */}
                <div
                    id="receipt-toast"
                    style={{
                        display: 'none',
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        right: 10,
                        background: '#10b981',
                        color: '#ffffff',
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        zIndex: 10,
                    }}
                >
                    🧾 Квитанция #4096 формируется и скачивается...
                </div>
            </Card>
            <Script fn={tableClientScript} />
        </WidgetLayout>
    ),
    initialState: () => ({}),
    actions: {
        downloadReceipt: async (ctx: WidgetActionContext<Record<string, unknown>>) => {
            await ctx.answer('RECEIPT_DOWNLOAD_STARTED');
            return { status: 'downloading', invoiceId: 4096 };
        },
    },
});
