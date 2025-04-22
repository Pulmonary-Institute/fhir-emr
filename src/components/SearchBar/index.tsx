import { Trans } from '@lingui/macro';
import { Button, Badge } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

import { SearchBarColumn } from './SearchBarColumn';
import { S } from './styles';
import { SearchBarData } from './types';
import { SearchBarMobile } from './SearchBarMobile';
import { isSearchBarFilter } from './utils';
import { useMemo } from 'react';

interface SearchBarProps extends SearchBarData {
    showInDrawerOnMobile?: boolean;
}

export function SearchBar(props: SearchBarProps) {
    const { columnsFilterValues, onChangeColumnFilter, onResetFilters, onApplyFilter, showInDrawerOnMobile = true } = props;
    const searchBarFilterValues = useMemo(
        () => columnsFilterValues.filter((filter) => isSearchBarFilter(filter)),
        [JSON.stringify(columnsFilterValues)],
    );
    const appliedFiltersCount = useMemo(() => {
        return searchBarFilterValues.reduce((count, filter) => {
            // Considerar que un filtro está aplicado si tiene algún valor
            if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
                return count + 1;
            }
            return count;
        }, 0);
    }, [searchBarFilterValues]);
    return (
        <>
            <S.SearchBar $showInDrawerOnMobile={showInDrawerOnMobile}>
                <Badge count={appliedFiltersCount} size="small">
                    <FilterOutlined style={{ fontSize: '16px', marginLeft: '8px' }} />
                </Badge>
                <S.LeftColumn>
                    {searchBarFilterValues.map((columnFilterValue) => (
                        <SearchBarColumn
                            key={`search-bar-column-${columnFilterValue.column.id}`}
                            columnFilterValue={columnFilterValue}
                            onChange={onChangeColumnFilter}
                        />
                    ))}
                </S.LeftColumn>

                <Button onClick={onResetFilters}>
                    <Trans>Clear filters</Trans>
                </Button>
                <Button type='primary' onClick={onApplyFilter}>
                    <Trans>Show results</Trans>
                </Button>
            </S.SearchBar>
            <S.MobileFilters $showInDrawerOnMobile={showInDrawerOnMobile}>
                <SearchBarMobile {...props} />
            </S.MobileFilters>
        </>
    );
}
