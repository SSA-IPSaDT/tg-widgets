import {
    Alert,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Divider,
    h,
    LucideIcon,
    LucideIcons,
    Script,
    Switch,
    WidgetLayout,
} from '../../src';
import { profileClientScript } from './client';
import type { ProfileState } from './screen';

/**
 * Visual presentation for the user profile widget.
 */
export const ProfileView = (props: ProfileState) => (
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
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                background:
                                    'linear-gradient(135deg, var(--tg-theme-button-color, #2481cc), #8b5cf6)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 15,
                                flexShrink: 0,
                            }}
                        >
                            {props.name.charAt(0)}
                        </div>
                        <div>
                            <CardTitle style={{ fontSize: 15 }}>{props.name}</CardTitle>
                            <CardDescription style={{ fontSize: 12 }}>
                                {props.username}
                            </CardDescription>
                        </div>
                    </div>
                    <Badge
                        variant="accent"
                        icon={LucideIcon({
                            icon: LucideIcons.Shield,
                            size: 15,
                        })}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                    }}
                >
                    <Switch
                        id="profile-notify"
                        checked={props.notifications}
                        label="Bot Notifications"
                        description="Instant alerts for incoming events"
                    />

                    <Divider />

                    <Switch
                        id="profile-private"
                        checked={props.privateMode}
                        label="Private Profile"
                        description="Hide activity from public leaderboards"
                    />

                    <Divider />

                    <Switch
                        id="profile-sound"
                        checked={props.soundEffects}
                        label="Sound Effects"
                        description="In-app UI auditory feedback"
                    />
                </div>

                <div style={{ marginTop: 14 }}>
                    <Alert
                        variant="warning"
                        title="Experimental Feature"
                        description="Widgets are in active testing. Switch modes if visual anomalies occur."
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    id="btn-fallback"
                    variant="outline"
                    fullWidth
                    size="md"
                    icon={LucideIcon({
                        icon: LucideIcons.ExternalLink,
                        size: 14,
                        style: { marginRight: 4 },
                    })}
                >
                    Plain Text View
                </Button>
            </CardFooter>
        </Card>
        <Script fn={profileClientScript} args={[props]} />
    </WidgetLayout>
);
