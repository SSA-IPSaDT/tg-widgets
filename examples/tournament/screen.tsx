import { defineWidgetScreen, type WidgetActionContext } from '../../src';
import { TournamentView } from './view';

export interface TournamentState {
    registeredRole?: 'volunteer' | 'participant';
    participantsCount: number;
    volunteersCount: number;
}

export * from './client';
export * from './view';

/**
 * Chess championship registration screen featuring role selection (Volunteer vs Player),
 * live registration counts, haptic feedback, and Telegram Mini App launcher.
 */
export const tournamentScreen = defineWidgetScreen({
    id: 'tournament',
    component: TournamentView,
    initialState: (): TournamentState => ({
        participantsCount: 38,
        volunteersCount: 7,
    }),
    actions: {
        registerVolunteer: async (ctx: WidgetActionContext<TournamentState>) => {
            const nextVolunteers = ctx.state.volunteersCount + 1;
            await ctx.setState({
                registeredRole: 'volunteer',
                volunteersCount: nextVolunteers,
            });
            return ctx.answer({
                text: 'Volunteer application submitted! Confirmation link sent.',
            });
        },
        registerParticipant: async (ctx: WidgetActionContext<TournamentState>) => {
            const nextParticipants = ctx.state.participantsCount + 1;
            await ctx.setState({
                registeredRole: 'participant',
                participantsCount: nextParticipants,
            });
            return ctx.answer({
                text: 'You are now registered as a tournament player!',
            });
        },
    },
});
