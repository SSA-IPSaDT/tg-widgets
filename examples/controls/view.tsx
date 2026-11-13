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
                    <CardTitle>Settings</CardTitle>
                    <Badge variant="accent">Active</Badge>
                </div>
                <CardDescription>Toggles, steppers, and plans</CardDescription>
            </CardHeader>
            <CardContent style={{ gap: 12 }}>
                <Switch
                    id="toggle-notify"
                    checked={props.notifications}
                    action="toggleNotifications"
                    label="Notifications"
                    description="Alerts"
                />

                <Divider />

                <Checkbox
                    id="chk-newsletter"
                    checked={props.newsletter}
                    action="toggleNewsletter"
                    label="Weekly Newsletter"
                    description="Highlights"
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
                        <div style={{ fontSize: 14, fontWeight: 500 }}>Tickets</div>
                        <div class="tg-description">Passes</div>
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
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Plan</div>
                    <RadioGroup gap={6}>
                        <Radio
                            id="plan-basic"
                            value="basic"
                            checked={props.plan === 'basic'}
                            action="setPlan:basic"
                            label="Basic"
                            description="Essential features"
                        />
                        <Radio
                            id="plan-pro"
                            value="pro"
                            checked={props.plan === 'pro'}
                            action="setPlan:pro"
                            label="Pro Plan"
                            description="Expanded limits"
                        />
                    </RadioGroup>
                </div>
            </CardContent>
        </Card>
        <Script fn={controlsClientScript} args={[props]} />
    </WidgetLayout>
);
