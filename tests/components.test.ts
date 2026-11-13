import { describe, expect, test } from 'bun:test';
import {
    Accordion,
    AccordionItem,
    Alert,
    AlertDescription,
    AlertTitle,
    Avatar,
    Badge,
    Banner,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Checkbox,
    Collapsible,
    DescriptionText,
    Divider,
    LucideIcon,
    LucideIcons,
    ProgressBar,
    Radio,
    RadioGroup,
    Script,
    SegmentedControl,
    Skeleton,
    Stepper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
    Typography,
    WidgetLayout,
    BASE_RESET_CSS,
} from '../src';

describe('Telegram UI Component Catalog & Profile 1 Compliance', () => {
    describe('WidgetLayout', () => {
        test('renders root container with tg-widget-root and embeds reset CSS style block', () => {
            const html = WidgetLayout({
                children: 'Content',
            });
            expect(html).toContain('class="tg-widget-root"');
            expect(html).toContain('<style>');
            expect(html).toContain('--tg-font-family');
            expect(html).toContain('Content');
        });

        test('supports fullWidth, fullHeight, and expand props', () => {
            const html = WidgetLayout({
                fullWidth: true,
                expand: true,
                children: 'Expanded',
            });
            expect(html).toContain('width:100%');
        });

        test('supports custom padding and gap', () => {
            const html = WidgetLayout({
                padding: '12px 16px',
                gap: 10,
                children: 'Padded',
            });
            expect(html).toContain('padding:12px 16px');
            expect(html).toContain('gap:10px');
        });

        test('applies theme color-scheme attribute when specified', () => {
            const light = WidgetLayout({ theme: 'light', children: 'Light' });
            expect(light).toContain('color-scheme:light');

            const dark = WidgetLayout({ theme: 'dark', children: 'Dark' });
            expect(dark).toContain('color-scheme:dark');
        });

        test('supports design token border radius system presets', () => {
            const lgRadius = WidgetLayout({ radius: 'lg', children: 'Rounded' });
            expect(lgRadius).toContain('--tg-radius-lg:18px');

            const smRadius = WidgetLayout({ radius: 'sm', children: 'Small Rounded' });
            expect(smRadius).toContain('--tg-radius-sm:6px');
        });
    });

    describe('Button', () => {
        test('renders primary variant with default size and tactile classes', () => {
            const btn = Button({ id: 'btn-submit', variant: 'primary', children: 'Save' });
            expect(btn).toContain('class="tg-btn tg-btn-primary tg-btn-md"');
            expect(btn).toContain('id="btn-submit"');
            expect(btn).toContain('Save');
        });

        test('renders all visual variants correctly', () => {
            const variants = ['primary', 'secondary', 'destructive', 'outline', 'ghost'] as const;
            for (const variant of variants) {
                const btn = Button({ variant, children: variant });
                expect(btn).toContain(`tg-btn-${variant}`);
            }
        });

        test('renders size options (sm, md, lg)', () => {
            const sm = Button({ size: 'sm', children: 'Small' });
            expect(sm).toContain('tg-btn-sm');

            const lg = Button({ size: 'lg', children: 'Large' });
            expect(lg).toContain('tg-btn-lg');
        });

        test('supports fullWidth and disabled state', () => {
            const btn = Button({ fullWidth: true, disabled: true, children: 'Disabled' });
            expect(btn).toContain('tg-btn-full');
            expect(btn).toContain('disabled');
            expect(btn).toContain('opacity:0.6');
        });

        test('supports loading indicator spinner', () => {
            const btn = Button({ loading: true, children: 'Loading...' });
            expect(btn).toContain('disabled');
            expect(btn).toContain('border:2px solid currentColor');
            expect(btn).toContain('Loading...');
        });

        test('renders icon alongside children', () => {
            const iconSvg = '<svg class="my-icon"></svg>';
            const btn = Button({ icon: iconSvg, children: 'With Icon' });
            expect(btn).toContain(iconSvg);
            expect(btn).toContain('With Icon');
        });
    });

    describe('Badge', () => {
        test('renders default and variant badges', () => {
            const badge = Badge({ variant: 'accent', children: 'PRO' });
            expect(badge).toContain('tg-badge');
            expect(badge).toContain('tg-badge-accent');
            expect(badge).toContain('PRO');
        });

        test('renders dot indicator mode with 50% border radius inside', () => {
            const dot = Badge({ variant: 'success', dot: true });
            expect(dot).toContain('border-radius:50%');
            expect(dot).toContain('background-color:currentColor');
        });

        test('renders pulsing live badge', () => {
            const pulse = Badge({ variant: 'destructive', pulse: true, children: 'LIVE' });
            expect(pulse).toContain('tg-badge-pulse');
            expect(pulse).toContain('LIVE');
        });

        test('preserves strict 1:1 square dimensions when icon is provided without children', () => {
            const icon = LucideIcon({ icon: LucideIcons.Flame, size: 14 });
            const iconBadge = Badge({ variant: 'accent', icon });
            expect(iconBadge).toContain('tg-badge-square');
            expect(iconBadge).toContain('aspect-ratio:1 / 1');
            expect(iconBadge).toContain('svg');
        });

        test('supports dynamic Telegram theme accent variables and color-mix in stylesheet', () => {
            expect(BASE_RESET_CSS).toContain('--tg-accent-color:var(--tg-theme-accent-text-color');
            expect(BASE_RESET_CSS).toContain(
                '.tg-badge-accent{--badge-accent:var(--tg-accent-color',
            );
            expect(BASE_RESET_CSS).toContain(
                'color-mix(in srgb,var(--badge-accent) 15%,transparent)',
            );
            expect(BASE_RESET_CSS).toContain(
                'color-mix(in srgb,var(--badge-accent) 30%,transparent)',
            );
        });
    });

    describe('Alert', () => {
        test('renders alert with variant and clean accent border without harsh white rim', () => {
            const alert = Alert({
                variant: 'success',
                title: 'Done',
                description: 'File downloaded',
            });
            expect(alert).toContain('tg-alert');
            expect(alert).toContain('tg-alert-success');
            expect(alert).toContain('Done');
            expect(alert).toContain('File downloaded');
            // Clean border check
            expect(alert).not.toContain('border: 1px solid #ffffff');
        });

        test('adapts info alert border and icon to dynamic theme accent color', () => {
            const infoAlert = Alert({ variant: 'info', title: 'Note' });
            expect(infoAlert).toContain('color-mix(in srgb, var(--tg-theme-accent-text-color');
            expect(infoAlert).toContain('tg-alert-info');
        });

        test('renders all 4 variants: info, success, warning, destructive', () => {
            const variants = ['info', 'success', 'warning', 'destructive'] as const;
            for (const variant of variants) {
                const el = Alert({ variant, title: `${variant} title` });
                expect(el).toContain(`tg-alert-${variant}`);
            }
        });

        test('supports compound syntax with AlertTitle and AlertDescription', () => {
            const compound = Alert({
                variant: 'destructive',
                children: [
                    AlertTitle({ children: 'Security Alert' }),
                    AlertDescription({ children: 'Unauthorized access detected' }),
                ],
            });
            expect(compound).toContain('Security Alert');
            expect(compound).toContain('Unauthorized access detected');
        });
    });

    describe('Card & Compound Structure', () => {
        test('renders compound Card with Header, Title, Description, Content, and Footer', () => {
            const card = Card({
                fullWidth: true,
                children: [
                    CardHeader({
                        children: [
                            CardTitle({ children: 'Analytics' }),
                            CardDescription({ children: 'Monthly Report' }),
                        ],
                    }),
                    CardContent({ children: 'Data Metrics' }),
                    CardFooter({ children: 'Page 1 of 5' }),
                ],
            });

            expect(card).toContain('tg-card');
            expect(card).toContain('tg-card-header');
            expect(card).toContain('Analytics');
            expect(card).toContain('Monthly Report');
            expect(card).toContain('tg-card-content');
            expect(card).toContain('Data Metrics');
            expect(card).toContain('tg-card-footer');
            expect(card).toContain('Page 1 of 5');
        });

        test('renders legacy header and footer props for backwards compatibility', () => {
            const card = Card({
                header: 'Legacy Header',
                footer: 'Legacy Footer',
                children: 'Legacy Content',
            });
            expect(card).toContain('Legacy Header');
            expect(card).toContain('Legacy Footer');
            expect(card).toContain('Legacy Content');
        });

        test('renders card variants (default, outlined, section, inset)', () => {
            const outlined = Card({ variant: 'outlined', children: 'Outlined' });
            expect(outlined).toContain('tg-card-outlined');

            const section = Card({ variant: 'section', children: 'Section' });
            expect(section).toContain('tg-card-section');
        });
    });

    describe('Profile 1 Strict Form Controls (Zero <input> tags)', () => {
        test('Switch renders track and thumb without any <input> element', () => {
            const sw = Switch({ id: 'sw-notif', label: 'Push Notifications', checked: true });
            expect(sw).toContain('tg-switch');
            expect(sw).toContain('tg-switch-track active');
            expect(sw).toContain('tg-switch-thumb');
            expect(sw).toContain('Push Notifications');
            expect(sw).not.toContain('<input');
        });

        test('Checkbox renders custom SVG check without any <input> element', () => {
            const chk = Checkbox({
                id: 'chk-agree',
                label: 'Agree to terms',
                description: 'Required to proceed',
                checked: true,
            });
            expect(chk).toContain('tg-checkbox');
            expect(chk).toContain('Agree to terms');
            expect(chk).toContain('Required to proceed');
            expect(chk).toContain('svg');
            expect(chk).not.toContain('<input');
        });

        test('Radio and RadioGroup render tactile options without any <input> element', () => {
            const r1 = Radio({ id: 'r1', value: 'opt1', label: 'Option 1', checked: true });
            const r2 = Radio({ id: 'r2', value: 'opt2', label: 'Option 2', checked: false });
            const group = RadioGroup({ children: [r1, r2] });

            expect(group).toContain('tg-radio-group');
            expect(group).toContain('Option 1');
            expect(group).toContain('Option 2');
            expect(group).not.toContain('<input');
        });

        test('Stepper renders square buttons and action handlers without <input>', () => {
            const step = Stepper({
                id: 'ticket-stepper',
                value: 3,
                min: 1,
                max: 10,
                step: 1,
            });
            expect(step).toContain('tg-stepper');
            expect(step).toContain('3');
            expect(step).toContain('data-action="decrement"');
            expect(step).toContain('data-action="increment"');
            expect(step).toContain('tg-stepper-btn');
            expect(step).not.toContain('<input');
        });
    });

    describe('Table Components', () => {
        test('renders Table, Header, Body, Footer, Rows, and Cells with alignment', () => {
            const table = Table({
                children: [
                    TableHeader({
                        children: TableRow({
                            children: [
                                TableHead({ children: 'Product' }),
                                TableHead({ align: 'center', children: 'Qty' }),
                                TableHead({ align: 'right', children: 'Price' }),
                            ],
                        }),
                    }),
                    TableBody({
                        children: TableRow({
                            children: [
                                TableCell({ children: 'Coffee' }),
                                TableCell({ align: 'center', children: '2' }),
                                TableCell({ align: 'right', children: '$8.00' }),
                            ],
                        }),
                    }),
                    TableFooter({
                        children: TableRow({
                            children: [
                                TableCell({ colspan: 2, children: 'Total' }),
                                TableCell({ align: 'right', children: '$8.00' }),
                            ],
                        }),
                    }),
                ],
            });

            expect(table).toContain('<table');
            expect(table).toContain('Product');
            expect(table).toContain('text-align:center');
            expect(table).toContain('text-align:right');
            expect(table).toContain('colspan="2"');
            expect(table).toContain('Coffee');
            expect(table).toContain('$8.00');
        });

        test('TableRow respects borderBottom=false without duplicating cell borders', () => {
            const defaultRow = TableRow({ children: TableCell({ children: 'Item' }) });
            expect(defaultRow).not.toContain('border-bottom:1px solid');

            const rowWithBorder = TableRow({
                borderBottom: true,
                children: TableCell({ children: 'Item' }),
            });
            expect(rowWithBorder).toContain('border-bottom:1px solid');

            const rowWithoutBorder = TableRow({
                borderBottom: false,
                children: TableCell({ children: 'Item' }),
            });
            expect(rowWithoutBorder).toContain('border-bottom:none');
            expect(rowWithoutBorder).toContain('tg-table-row-noborder');
        });
    });

    describe('Accordion & Collapsible', () => {
        test('renders native HTML5 details and summary elements for offline zero-JS folding', () => {
            const accordion = Accordion({
                children: [
                    AccordionItem({
                        title: 'How does it work?',
                        open: true,
                        children: 'It renders in QuickJS Profile 1.',
                    }),
                    Collapsible({
                        title: 'Is internet needed?',
                        children: 'No, completely offline.',
                    }),
                ],
            });

            expect(accordion).toContain('<details open');
            expect(accordion).toContain('<summary');
            expect(accordion).toContain('How does it work?');
            expect(accordion).toContain('It renders in QuickJS Profile 1.');
            expect(accordion).toContain('Is internet needed?');
            expect(accordion).toContain('tg-accordion-chevron');
        });
    });

    describe('ProgressBar', () => {
        test('renders progress track with clamped percentage', () => {
            const normal = ProgressBar({ percent: 65 });
            expect(normal).toContain('width:65%');
            expect(normal).toContain('tg-progress');

            // Values below 0 should clamp to 0
            const negative = ProgressBar({ percent: -10 });
            expect(negative).toContain('width:0%');

            // Values above 100 should clamp to 100
            const over = ProgressBar({ percent: 150 });
            expect(over).toContain('width:100%');
        });

        test('supports custom color and height', () => {
            const custom = ProgressBar({ percent: 50, color: '#10b981', height: 12 });
            expect(custom).toContain('background:#10b981');
            expect(custom).toContain('height:12px');
        });
    });

    describe('SegmentedControl (Tabs)', () => {
        test('renders segmented options with active selection indicator', () => {
            const seg = SegmentedControl({
                id: 'seg-period',
                items: [
                    { id: 'day', label: 'Day' },
                    { id: 'month', label: 'Month' },
                    { id: 'year', label: 'Year' },
                ],
                activeId: 'month',
            });
            expect(seg).toContain('tg-segmented-control');
            expect(seg).toContain('Day');
            expect(seg).toContain('Month');
            expect(seg).toContain('Year');
            expect(seg).toContain('active');
            expect(seg).toContain('data-tab-target="month"');
        });
    });

    describe('Typography & DescriptionText', () => {
        test('Typography renders title, body, and caption variants', () => {
            const title = Typography({ variant: 'title', children: 'Dashboard Title' });
            expect(title).toContain('font-size:20px');
            expect(title).toContain('Dashboard Title');

            const caption = Typography({ variant: 'caption', children: 'Last updated 1m ago' });
            expect(caption).toContain('font-size:12px');
        });

        test('DescriptionText strictly renders unified font-weight 500 typography', () => {
            const desc = DescriptionText({ children: 'System description note' });
            expect(desc).toContain('font-weight:500');
            expect(desc).toContain('font-size:12.5px');
            expect(desc).toContain('System description note');
        });
    });

    describe('Divider, Avatar, Skeleton, Banner', () => {
        test('Divider renders horizontal border rule', () => {
            const divider = Divider({});
            expect(divider).toContain('tg-divider');
        });

        test('Avatar renders fallback initials when image is not present', () => {
            const av = Avatar({ fallback: 'JD', size: 'md' });
            expect(av).toContain('tg-avatar');
            expect(av).toContain('JD');
        });

        test('Avatar renders image when src is provided', () => {
            const av = Avatar({ src: 'https://example.com/pic.jpg', alt: 'User Pic' });
            expect(av).toContain('<img src="https://example.com/pic.jpg" alt="User Pic"');
        });

        test('Skeleton renders placeholder with pulse shimmer', () => {
            const sk = Skeleton({ width: 120, height: 18 });
            expect(sk).toContain('tg-skeleton');
            expect(sk).toContain('width:120px');
            expect(sk).toContain('height:18px');
        });

        test('Banner renders callout notification banner with badge and children', () => {
            const banner = Banner({
                badge: 'NEW',
                children: 'Welcome to the platform',
            });
            expect(banner).toContain('tg-banner');
            expect(banner).toContain('NEW');
            expect(banner).toContain('Welcome to the platform');
        });
    });

    describe('LucideIcon & Script', () => {
        test('LucideIcon renders SVG vector path with custom dimensions and colors', () => {
            const icon = LucideIcon({
                icon: LucideIcons.Sparkles,
                size: 16,
                color: '#f59e0b',
                strokeWidth: 2.5,
            });
            expect(icon).toContain('<svg');
            expect(icon).toContain('width="16"');
            expect(icon).toContain('height="16"');
            expect(icon).toContain('stroke="#f59e0b"');
            expect(icon).toContain('stroke-width="2.5"');
        });

        test('Script serializes inline IIFE with arguments', () => {
            const clientFn = (args: { count: number }) => {
                console.log(args.count);
            };
            const scriptTag = Script({ fn: clientFn, args: [{ count: 42 }] });
            expect(scriptTag).toContain('<script>');
            expect(scriptTag).toContain('42');
            expect(scriptTag).toContain('</script>');
        });
    });
});
