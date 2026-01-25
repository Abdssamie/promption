import { useAppStore } from '../store/appStore';
import { getItemTypeColor } from '../lib/utils';
import type { ItemType } from '../types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const types: { label: string; value: ItemType | null }[] = [
    { label: 'All', value: null },
    { label: 'Skills', value: 'skill' },
    { label: 'Rules', value: 'rule' },
    { label: 'Workflows', value: 'workflow' },
];

export function TypeFilter() {
    const typeFilter = useAppStore((s) => s.typeFilter);
    const setTypeFilter = useAppStore((s) => s.setTypeFilter);

    return (
        <Tabs value={typeFilter ?? 'all'} onValueChange={(value) => setTypeFilter(value === 'all' ? null : value as ItemType)}>
            <TabsList>
                {types.map((type) => (
                    <TabsTrigger
                        key={type.value ?? 'all'}
                        value={type.value ?? 'all'}
                        style={
                            typeFilter === type.value && type.value
                                ? { borderLeft: `3px solid ${getItemTypeColor(type.value)}` }
                                : undefined
                        }
                    >
                        {type.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
