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

export const ControlsView = (props: ControlsState): string => {
    const notify = props.notify ?? props.notifications ?? true;
    const news = props.news ?? props.newsletter ?? false;

    return (
        <WidgetLayout padding="6px 8px">
            <Card>
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
                <CardContent style={{ gap: 12 }}>
                    <Switch
                        id="toggle-notify"
                        checked={notify}
                        action="toggleNotify"
                        label="Notifications"
                        description="Receive alerts for important updates"
                    />

                    <Divider />

                    <Checkbox
                        id="chk-news"
                        checked={news}
                        action="toggleNews"
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
                            <div class="tg-description">Event entry passes</div>
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
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
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
                </CardContent>
            </Card>
            <Script fn={controlsClientScript} args={[props]} />
        </WidgetLayout>
    );
};
