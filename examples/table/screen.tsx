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

    btn?.addEventListener('click', () => {
        W?.HapticFeedback?.notificationOccurred?.('success');
        W?.request?.('downloadReceipt');
    });
};

/**
 * Экран нативной таблицы с чеком заказа и скачиванием квитанции
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
                        <CardTitle>Чек заказа #4096</CardTitle>
                        <Badge
                            variant="success"
                            icon={LucideIcon({
                                icon: LucideIcons.Check,
                                size: 15,
                                color: '#10b981',
                            })}
                        />
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
                            <TableRow borderBottom={false}>
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
                        size="md"
                        icon={LucideIcon({
                            icon: LucideIcons.Download,
                            size: 14,
                            style: { marginRight: 6 },
                        })}
                    >
                        Скачать квитанцию
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
                text: '🧾 Квитанция #4096 успешно сформирована',
                show_alert: false,
            });
        },
    },
});
