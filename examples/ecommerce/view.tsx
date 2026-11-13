import {
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
    WidgetLayout,
} from '../../src';
import { ecommerceClientScript } from './client';
import { QuantityCounter, SizePicker } from './components';
import type { EcommerceState } from './screen';

export { QuantityCounter, SizePicker } from './components';

export const EcommerceProductView = (props: EcommerceState): string => {
    const sizes = [41, 42, 43, 44];
    const total = (props.quantity * props.pricePerUnit).toFixed(2);

    return (
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
                        <CardTitle>HyperSpeed Running Shoes</CardTitle>
                        <Badge
                            variant="success"
                            icon={LucideIcon({
                                icon: LucideIcons.Check,
                                size: 15,
                                strokeWidth: 2.2,
                            })}
                        />
                    </div>
                    <CardDescription>
                        Authentic performance footwear with express delivery
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SizePicker sizes={sizes} selectedSize={props.size} />

                    <Divider />

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>Quantity</div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: 'var(--tg-theme-text-color, #111827)',
                                    opacity: 0.65,
                                }}
                            >
                                ${props.pricePerUnit} / pair
                            </div>
                        </div>
                        <QuantityCounter quantity={props.quantity} />
                    </div>

                    <Divider />

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <span style={{ fontSize: 14, fontWeight: 600 }}>Total:</span>
                        <span
                            id="ecom-total"
                            style={{
                                fontSize: 20,
                                fontWeight: 800,
                                color: 'var(--tg-theme-link-color, var(--tg-theme-text-color, #2481cc))',
                            }}
                        >
                            ${total}
                        </span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        id="btn-checkout"
                        variant="primary"
                        fullWidth
                        size="md"
                        icon={LucideIcon({
                            icon: LucideIcons.ShoppingBag,
                            size: 16,
                            color: '#ffffff',
                            style: { marginRight: 6 },
                        })}
                    >
                        Place Order
                    </Button>
                </CardFooter>

                <div
                    id="ecom-toast"
                    style={{
                        display: 'none',
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        right: 10,
                        background: '#10b981',
                        color: '#ffffff',
                        padding: '12px 14px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        zIndex: 10,
                    }}
                />
            </Card>
            <Script fn={ecommerceClientScript} args={[props]} />
        </WidgetLayout>
    );
};
