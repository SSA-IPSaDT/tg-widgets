import {
    Accordion,
    AccordionItem,
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Collapsible,
    defineWidgetScreen,
    h,
    LucideIcon,
    LucideIcons,
    WidgetLayout,
} from '../../src';

/**
 * Экран демонстрации аккордеона (<details> / <summary>)
 */
export const accordionScreen = defineWidgetScreen({
    id: 'accordion',
    component: () => (
        <WidgetLayout fullWidth padding="6px 8px">
            <Card fullWidth>
                <CardHeader>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <CardTitle>Частые вопросы</CardTitle>
                        <Badge
                            variant="accent"
                            icon={LucideIcon({
                                icon: LucideIcons.HelpCircle,
                                size: 13,
                                color: 'var(--tg-theme-link-color, #2481cc)',
                            })}
                        />
                    </div>
                    <CardDescription>
                        Тестирование нативного элемента &lt;details&gt; в виджетах Telegram
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion>
                        <AccordionItem
                            title="Как работают HTML-виджеты?"
                            open={true}
                        >
                            Виджеты рендерятся прямо внутри баббла сообщения с
                            помощью встроенной песочницы QuickJS на клиенте Telegram.
                        </AccordionItem>
                        <AccordionItem title="Нужен ли интернет для рендера?">
                            Нет, код виджета фиксируется в сообщении при отправке и
                            отрисовывается мгновенно в локальном офлайне.
                        </AccordionItem>
                        <Collapsible title="Как виджет общается с ботом?">
                            Через вызов TelegramWidget.request(), который доставляет
                            компактный запрос до 64 байт в виде update.widget_query.
                        </Collapsible>
                    </Accordion>
                </CardContent>
                <CardFooter>
                    <span
                        style={{
                            fontSize: 11,
                            color: 'var(--tg-theme-text-color, #111827)',
                            opacity: 0.65,
                        }}
                    >
                        Нажмите на любой пункт, чтобы раскрыть
                    </span>
                </CardFooter>
            </Card>
        </WidgetLayout>
    ),
    initialState: () => ({}),
});
