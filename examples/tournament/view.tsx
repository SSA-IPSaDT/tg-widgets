import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Divider,
    h,
    LucideIcon,
    LucideIcons,
    Script,
    WidgetLayout,
} from '../../src';
import { tournamentClientScript } from './client';
import type { TournamentState } from './screen';

export const TournamentView = (props: TournamentState): string => (
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
                    <CardTitle>Chess Championship 2026</CardTitle>
                    <Badge
                        variant="warning"
                        icon={LucideIcon({
                            icon: LucideIcons.Trophy,
                            size: 15,
                        })}
                    />
                </div>
                <CardDescription
                    style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--tg-theme-text-color)',
                        opacity: 0.9,
                        lineHeight: 1.45,
                    }}
                >
                    Join our annual spring chess championship (Rapid 10+5). We welcome both
                    competitive players and event volunteers!
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Tournament metadata tiles */}
                <div
                    style={{
                        display: 'flex',
                        gap: 6,
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            padding: '8px 4px',
                            borderRadius: 10,
                            background: 'var(--tg-theme-secondary-bg-color)',
                        }}
                    >
                        <div style={{ fontSize: 11, opacity: 0.65 }}>Date</div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>May 25</div>
                    </div>
                    <div
                        style={{
                            flex: 1,
                            padding: '8px 4px',
                            borderRadius: 10,
                            background: 'var(--tg-theme-secondary-bg-color)',
                        }}
                    >
                        <div style={{ fontSize: 11, opacity: 0.65 }}>Format</div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>7 Rounds</div>
                    </div>
                    <div
                        style={{
                            flex: 1,
                            padding: '8px 4px',
                            borderRadius: 10,
                            background: 'var(--tg-theme-secondary-bg-color)',
                        }}
                    >
                        <div style={{ fontSize: 11, opacity: 0.65 }}>Prize Pool</div>
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: 'var(--tg-theme-link-color)',
                            }}
                        >
                            $1,000
                        </div>
                    </div>
                </div>

                <Divider />

                {/* Registration tally */}
                <div
                    id="tour-stats"
                    style={{
                        fontSize: 12.5,
                        textAlign: 'center',
                        fontWeight: 500,
                        color: 'var(--tg-theme-text-color)',
                        opacity: 0.85,
                    }}
                >
                    Participants: {props.participantsCount} • Volunteers: {props.volunteersCount}
                </div>

                <Divider />

                {/* Role selection buttons */}
                <div>
                    <div
                        style={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: 'var(--tg-theme-text-color)',
                            marginBottom: 8,
                        }}
                    >
                        Register As:
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                            id="btn-volunteer"
                            variant="outline"
                            fullWidth
                            size="md"
                            icon={LucideIcon({
                                icon: LucideIcons.User,
                                size: 15,
                                style: { marginRight: 4 },
                            })}
                        >
                            Volunteer
                        </Button>
                        <Button
                            id="btn-participant"
                            variant="primary"
                            fullWidth
                            size="md"
                            icon={LucideIcon({
                                icon: LucideIcons.Trophy,
                                size: 15,
                                color: '#ffffff',
                                style: { marginRight: 4 },
                            })}
                        >
                            Player
                        </Button>
                    </div>
                </div>
            </CardContent>

            {/* Floating toast notification */}
            <div
                id="tour-toast"
                style={{
                    display: 'none',
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    right: 10,
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontWeight: 600,
                    textAlign: 'center',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
            />
        </Card>
        <Script fn={tournamentClientScript} args={[props]} />
    </WidgetLayout>
);
