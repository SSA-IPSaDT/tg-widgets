import {
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Checkbox,
    Divider,
    h,
    LucideIcon,
    LucideIcons,
    Radio,
    RadioGroup,
    Script,
    Stepper,
    Switch,
    WidgetLayout,
} from '../../src';
import { controlsClientScript } from './client';
import type { ControlsState } from './screen';

export const ControlsView = (props: ControlsState): string => (
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
                    <CardTitle>Subscription Settings</CardTitle>
                    <Badge
                        variant="accent"
                        icon={LucideIcon({
                            icon: LucideIcons.Sliders,
                            size: 15,
                        })}
                    />
                </div>
                <CardDescription>
                    Checkboxes, switches, and steppers with zero native form controls
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                    }}
                >
                    <Switch
                        id="toggle-notify"
                        checked={props.notifications}
                        action="toggleNotifications"
                        label="Notifications"
                        description="Receive alerts for important updates"
                    />

                    <Divider />

                    <Checkbox
                        id="chk-newsletter"
                        checked={props.newsletter}
                        action="toggleNewsletter"
                        label="Weekly Newsletter"
                        description="Product updates and feature highlights"
                    />

                    <Divider />

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>Seat Allocation</div>
                            <div
                                class="tg-description"
                                style={{
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: 'var(--tg-theme-subtitle-text-color, var(--tg-theme-text-color, #111827))',
                                    opacity: 0.85,
                                }}
                            >
                                Event entry passes
                            </div>
                        </div>
                        <Stepper
                            id="stepper-tickets"
                            value={props.tickets}
                            min={1}
                            max={10}
                            decrementAction="ticketMinus"
                            incrementAction="ticketPlus"
                        />
                    </div>

                    <Divider />

                    <div>
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                marginBottom: 6,
                            }}
                        >
                            Subscription Plan
                        </div>
                        <RadioGroup gap={6}>
                            <Radio
                                id="plan-basic"
                                value="basic"
                                checked={props.plan === 'basic'}
                                action="setPlan:basic"
                                label="Basic"
                                description="Free access to essential features"
                            />
                            <Radio
                                id="plan-pro"
                                value="pro"
                                checked={props.plan === 'pro'}
                                action="setPlan:pro"
                                label="Pro Plan"
                                description="Priority support and expanded limits"
                            />
                        </RadioGroup>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Script fn={controlsClientScript} args={[props]} />
    </WidgetLayout>
);
