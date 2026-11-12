/**
 * Centralized barrel export for all example Telegram Widget screens.
 *
 * @module examples
 */

import { accordionScreen, type AccordionState } from './accordion/screen';
import { alertsScreen, type AlertsState } from './alerts/screen';
import { cardsScreen, type CardsState } from './cards/screen';
import { controlsScreen, type ControlsState } from './controls/screen';
import { counterScreen, type CounterState } from './counter/screen';
import { cryptoScreen, type CryptoState } from './crypto/screen';
import { ecommerceScreen, type EcommerceState } from './ecommerce/screen';
import { pollScreen, type PollState } from './poll/screen';
import { profileScreen, type ProfileState } from './profile/screen';
import { tableScreen, type TableState } from './table/screen';
import { tournamentScreen, type TournamentState } from './tournament/screen';

export {
    accordionScreen,
    alertsScreen,
    cardsScreen,
    controlsScreen,
    counterScreen,
    cryptoScreen,
    ecommerceScreen,
    pollScreen,
    profileScreen,
    tableScreen,
    tournamentScreen,
};

export type {
    AccordionState,
    AlertsState,
    CardsState,
    ControlsState,
    CounterState,
    CryptoState,
    EcommerceState,
    PollState,
    ProfileState,
    TableState,
    TournamentState,
};

/**
 * Registry of all available example widget screens.
 */
export const screens = {
    accordion: accordionScreen,
    controls: controlsScreen,
    table: tableScreen,
    alerts: alertsScreen,
    cards: cardsScreen,
    counter: counterScreen,
    poll: pollScreen,
    ecommerce: ecommerceScreen,
    profile: profileScreen,
    tournament: tournamentScreen,
    crypto: cryptoScreen,
};

export type Screens = typeof screens;
