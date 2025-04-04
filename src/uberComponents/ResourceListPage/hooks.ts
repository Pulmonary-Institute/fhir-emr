import { TablePaginationConfig } from 'antd';
import { Bundle, Resource } from 'fhir/r4b';
import { useEffect, useMemo, useState } from 'react';

import { SearchParams } from '@beda.software/fhir-react';
import { isSuccess, mapSuccess } from '@beda.software/remote-data';

import { ColumnFilterValue } from 'src/components/SearchBar/types';
import { getSearchBarColumnFilterValue } from 'src/components/SearchBar/utils';
import { usePagerExtended } from 'src/hooks/pager';
import { useDebounce } from 'src/utils/debounce';

export function useResourceListPage<R extends Resource>(
    resourceType: R['resourceType'],
    extractPrimaryResources: ((bundle: Bundle) => R[]) | undefined,
    filterValues: ColumnFilterValue[],
    defaultSearchParams: SearchParams,
    defaultPageSize?: number,
) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const debouncedFilterValues = useDebounce(filterValues, 300);

    const searchBarSearchParams = {
        ...Object.fromEntries(
            debouncedFilterValues.map((filterValue) => [
                filterValue.column.searchParam ?? filterValue.column.id,
                getSearchBarColumnFilterValue(filterValue),
            ]),
        ),
    };
    const searchParams = { _sort: '-_lastUpdated', ...defaultSearchParams, ...searchBarSearchParams };
    const {
        resourceResponse,
        pagerManager,
        handleTableChange: pagerHandleTableChange,
        pagination,
    } = usePagerExtended<R, ColumnFilterValue[]>(resourceType, searchParams, undefined, defaultPageSize);
    const handleTableChange = async (pagination: TablePaginationConfig) => {
        // Handle pagination only
        if (typeof pagination.current !== 'number') {
            return;
        }

        pagerHandleTableChange(pagination);
        setSelectedRowKeys([]);
    };

    useEffect(() => {
        setSelectedRowKeys([]);
    }, [JSON.stringify(searchParams)]);

    const reload = () => {
        setSelectedRowKeys([]);
        pagerManager.reload();
    };

    const extractPrimaryResourcesMemoized = useMemo(() => {
        return extractPrimaryResources ?? extractPrimaryResourcesFactory(resourceType);
    }, [resourceType, extractPrimaryResources]);

    // Original recordReponse
    // const recordResponse = mapSuccess(resourceResponse, (bundle) =>
    //     extractPrimaryResourcesMemoized(bundle as Bundle).map((resource) => ({
    //         resource: resource as R,
    //         bundle: bundle as Bundle,
    //     })),
    // );

    // New recordResponse
    const recordResponse = mapSuccess(resourceResponse, (bundle) => {
        const extractedResources = extractPrimaryResourcesMemoized(bundle as Bundle);

        const mappedResponse = extractedResources.map((resource) => {
            const record = {
                resource: resource as R,
                bundle: bundle as Bundle,
            };
            return record;
        });

        return mappedResponse;
    });

    const selectedResourcesBundle: Bundle<R> = {
        resourceType: 'Bundle',
        type: 'collection',
        entry: isSuccess(recordResponse)
            ? recordResponse.data
                  .filter(
                      ({ resource }) =>
                          resource.resourceType === resourceType && selectedRowKeys.includes(resource.id!),
                  )
                  .map(({ resource }) => ({ resource: resource as R }))
            : [],
    };

    return {
        pagination,
        recordResponse,
        handleTableChange,
        selectedRowKeys,
        setSelectedRowKeys,
        selectedResourcesBundle,
        reload,
    };
}

// Original extractPrimaryResourcesFactory
// function extractPrimaryResourcesFactory<R extends Resource>(resourceType: R['resourceType']) {
//     return (bundle: Bundle) => {
//         return (bundle.entry ?? [])
//             .filter((entry) => entry.resource?.resourceType === resourceType)
//             .map((entry) => entry.resource as R);
//     };
// }

// New extractPrimaryResourcesFactory
function extractPrimaryResourcesFactory<R extends Resource>(resourceType: R['resourceType']) {
    return (bundle: Bundle) => {
        const filteredResources = (bundle.entry ?? [])
            .filter((entry) => {
                const isMatchingType = entry.resource?.resourceType === resourceType;

                return isMatchingType;
            })
            .map((entry) => entry.resource as R);

        return filteredResources;
    };
}
