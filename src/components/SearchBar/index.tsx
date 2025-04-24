import { Trans } from '@lingui/macro';
import { Button, Badge, Modal } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

import { SearchBarColumn } from './SearchBarColumn';
import { S } from './styles';
import { SearchBarData } from './types';
import { SearchBarMobile } from './SearchBarMobile';
import { isSearchBarFilter, isGroupedInModal, isSearchBarDownFilter } from './utils';
import { useState, useMemo } from 'react';

interface SearchBarProps extends SearchBarData {
    showInDrawerOnMobile?: boolean;
}

export function SearchBar(props: SearchBarProps) {
    const { columnsFilterValues, onChangeColumnFilter, onResetFilters, onApplyFilter, showInDrawerOnMobile = true } = props;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const searchBarFilterValues = useMemo(
        () => columnsFilterValues.filter((filter) => isSearchBarFilter(filter)),
        [JSON.stringify(columnsFilterValues)],
    );
    const searchBarFilterInModal = useMemo(
        () => columnsFilterValues.filter((filter) => isGroupedInModal(filter)),
        [JSON.stringify(columnsFilterValues)],
    );
    const searchBarFilterValuesDown = useMemo(
        () => columnsFilterValues.filter((filter) => isSearchBarDownFilter(filter)),
        [JSON.stringify(columnsFilterValues)],
    );
    const appliedFiltersCount = useMemo(() => {
        return searchBarFilterInModal.reduce((count, filter) => {
            if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
                return count + 1;
            }
            return count;
        }, 0);
    }, [searchBarFilterValues]);
    return (
        <>
            <S.SearchBar $showInDrawerOnMobile={showInDrawerOnMobile}>
                <S.LeftColumn>
                    {searchBarFilterValues.map((columnFilterValue) => (
                        <SearchBarColumn
                            key={`search-bar-column-${columnFilterValue.column.id}`}
                            columnFilterValue={columnFilterValue}
                            onChange={onChangeColumnFilter}
                        />
                    ))}
                    {searchBarFilterInModal.length > 0 && (
                        <Badge count={appliedFiltersCount} size="default">
                            <FilterOutlined style={{ fontSize: '16px', marginLeft: '8px', cursor: 'pointer' }}
                                onClick={() => setIsModalVisible(true)} />
                        </Badge>
                    )}
                </S.LeftColumn>
                <S.LeftColumn>
                    <Button onClick={onResetFilters}>
                        <Trans>Clear filters</Trans>
                    </Button>
                    <Button type='primary' onClick={onApplyFilter}>
                        <Trans>Show results</Trans>
                    </Button>
                </S.LeftColumn>
                <S.BottomRow>
                    {searchBarFilterValuesDown.map((columnFilterValue) => (
                        <SearchBarColumn
                            key={`search-bar-column-${columnFilterValue.column.id}`}
                            columnFilterValue={columnFilterValue}
                            onChange={onChangeColumnFilter}
                        />
                    ))}
                </S.BottomRow>
            </S.SearchBar>
            <Modal
                title={<Trans>Filters</Trans>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => {
                    setIsModalVisible(false);
                }}
                footer={[
                    <Button key="clear" onClick={() => {
                        setIsModalVisible(false);
                    }}>
                        <Trans>Cancel</Trans>
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => {
                        setIsModalVisible(false);
                        onApplyFilter?.()
                    }}>
                        <Trans>Show results</Trans>
                    </Button>,
                ]}
            >
                {searchBarFilterInModal.map((columnFilterValue) => (
                    <div key={`modal-search-bar-column-${columnFilterValue.column.id}`} style={{ marginBottom: 16 }}>
                        <SearchBarColumn
                            columnFilterValue={columnFilterValue}
                            onChange={onChangeColumnFilter}
                        />
                    </div>
                ))}
            </Modal>
            <S.MobileFilters $showInDrawerOnMobile={showInDrawerOnMobile}>
                <SearchBarMobile {...props} />
            </S.MobileFilters>
        </>
    );
}
