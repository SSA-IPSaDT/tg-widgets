import {
    Alert,
    defineWidgetScreen,
    h,
    WidgetLayout,
} from '../../src';

/**
 * Экран демонстрации системных уведомлений и статусов (Alerts)
 */
export const alertsScreen = defineWidgetScreen({
    id: 'alerts',
    component: () => (
        <WidgetLayout gap={8} fullWidth padding={0}>
            <Alert
                variant="info"
                title="Информация"
                description="Виджеты поддерживают цветовую палитру темы пользователя."
            />
            <Alert
                variant="success"
                title="Успешно сохранено"
                description="Ваши данные были синхронизированы с облаком."
            />
            <Alert
                variant="warning"
                title="Внимание"
                description="Размер сжатого виджета ограничен 4096 байтами."
            />
            <Alert
                variant="destructive"
                title="Критическая ошибка"
                description="Действие не может быть выполнено без авторизации."
            />
        </WidgetLayout>
    ),
    initialState: () => ({}),
});
