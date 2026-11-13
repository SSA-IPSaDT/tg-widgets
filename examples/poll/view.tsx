import {
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    h,
    LucideIcon,
    LucideIcons,
    Script,
    WidgetLayout,
} from '../../src';
import { pollClientScript } from './client';
import type { PollState } from './screen';

/**
 * Visual presentation for the interactive community poll widget.
 */
export const PollView = (props: PollState) => {
    const total = Math.max(1, props.votes.grammy + props.votes.telegraf + props.votes.aiogram);
    const options = [
        { key: 'grammy' as const, label: 'grammY (TypeScript)', count: props.votes.grammy },
        {
            key: 'telegraf' as const,
            label: 'Telegraf (JavaScript)',
            count: props.votes.telegraf,
        },
        { key: 'aiogram' as const, label: 'aiogram (Python)', count: props.votes.aiogram },
    ];

    return (
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
                        <CardTitle>Framework Poll</CardTitle>
                        <Badge
                            variant="accent"
                            icon={LucideIcon({
                                icon: LucideIcons.Flame,
                                size: 15,
                            })}
                        />
                    </div>
                    <CardDescription>
                        Which framework do you use for Telegram bot development?
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <style>
                        {'.poll-row{position:relative;overflow:hidden;border-radius:var(--tg-radius-md,10px);border:1px solid rgba(120,120,128,0.16);background:rgba(120,120,128,0.06);padding:12px 14px;min-height:46px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;cursor:pointer;user-select:none;touch-action:manipulation;transition:border-color .12s,background .12s;}' +
                            '.poll-row.selected{border-color:var(--tg-accent-color,var(--tg-theme-button-color,#2481cc));}' +
                            '.poll-row.selected::before{content:"";position:absolute;inset:0;background:var(--tg-accent-color,var(--tg-theme-button-color,#2481cc));opacity:0.08;pointer-events:none;}' +
                            '.poll-bar{position:absolute;top:0;left:0;bottom:0;background:var(--tg-accent-color,var(--tg-theme-button-color,#2481cc));opacity:0.22;border-radius:var(--tg-radius-md,9px);transition:width .15s cubic-bezier(0.2,0,0,1);z-index:0;}'}
                    </style>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {options.map((opt) => {
                            const pct = Math.round((opt.count / total) * 100);
                            const isSelected = props.userVote === opt.key;
                            return (
                                <div
                                    id={`poll-row-${opt.key}`}
                                    class={`poll-row ${isSelected ? 'selected' : ''}`.trim()}
                                    data-action={`vote:${opt.key}`}
                                >
                                    <div class="poll-bar" style={{ width: `${pct}%` }} />
                                    <div
                                        style={{
                                            position: 'relative',
                                            zIndex: 1,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span style={{ fontSize: 13.5, fontWeight: 500 }}>
                                            {opt.label}
                                        </span>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                            }}
                                        >
                                            <span
                                                class="poll-count tg-description"
                                                style={{ fontSize: 12 }}
                                            >
                                                {opt.count} votes
                                            </span>
                                            <span
                                                class="poll-pct"
                                                style={{
                                                    fontSize: 13.5,
                                                    fontWeight: 700,
                                                    minWidth: 34,
                                                    textAlign: 'right',
                                                }}
                                            >
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
                <CardFooter>
                    <span
                        id="poll-total-votes"
                        class="tg-description"
                        style={{
                            fontSize: 11.5,
                            fontWeight: 500,
                            color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, #111827))',
                            opacity: 0.85,
                        }}
                    >
                        Total votes:{' '}
                        {props.votes.grammy + props.votes.telegraf + props.votes.aiogram}
                    </span>
                    <span
                        class="tg-description"
                        style={{
                            fontSize: 11.5,
                            fontWeight: 500,
                            color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, #111827))',
                            opacity: 0.85,
                        }}
                    >
                        Tap an option to cast your vote
                    </span>
                </CardFooter>
            </Card>
            <Script fn={pollClientScript} args={[props]} />
        </WidgetLayout>
    );
};
