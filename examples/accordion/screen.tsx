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
    defineClientWidgetScreen,
    h,
    LucideIcon,
    LucideIcons,
    WidgetLayout,
} from '../../src';

/**
 * State contract for the accordion widget.
 */
export type AccordionState = Record<string, never>;

/**
 * Accordion screen demonstrating native HTML5 `<details>` and `<summary>` folding.
 * Defines a client-side interactive widget screen:
 * - Local interactive folding without round trips to the bot
 * - allow_queries: false (disables unnecessary server queries)
 * - Server state storage is bypassed (0 memory overhead)
 * - Requires 0 bytes of JavaScript runtime for expand/collapse transitions
 *
 * @example
 * await ctx.widgets.reply('accordion', { props: {} });
 */
export const accordionScreen = defineClientWidgetScreen({
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
                        <CardTitle>Frequently Asked Questions</CardTitle>
                        <Badge
                            variant="accent"
                            icon={LucideIcon({
                                icon: LucideIcons.HelpCircle,
                                size: 15,
                            })}
                        />
                    </div>
                    <CardDescription>
                        Native &lt;details&gt; element in Telegram QuickJS Profile 1
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion>
                        <AccordionItem title="How do HTML widgets work?" open={true}>
                            Widgets render directly inside the chat message bubble using Telegram's
                            embedded QuickJS sandbox.
                        </AccordionItem>
                        <AccordionItem title="Is internet required to render?">
                            No, the widget code is bundled into the message and renders instantly in
                            local offline mode.
                        </AccordionItem>
                        <Collapsible title="How do widgets communicate with the bot?">
                            Via TelegramWidget.request(), delivering compact action payloads (up to
                            64 bytes) to update.widget_query.
                        </Collapsible>
                    </Accordion>
                </CardContent>
                <CardFooter>
                    <span
                        class="tg-description"
                        style={{
                            fontSize: 11.5,
                            fontWeight: 500,
                            color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, #111827))',
                            opacity: 0.85,
                        }}
                    >
                        Tap any item to expand details
                    </span>
                </CardFooter>
            </Card>
        </WidgetLayout>
    ),
});
