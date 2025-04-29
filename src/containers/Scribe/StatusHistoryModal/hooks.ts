import { Task } from 'fhir/r4b';

import type { ChangesDiffChange } from '@beda.software/emr/components';
import { formatHumanDateTime } from '@beda.software/emr/dist/utils/date';
import { loadResourceHistory } from '@beda.software/emr/services';
import { extractBundleResources, useService } from '@beda.software/fhir-react';
import { mapSuccess, resolveMap } from '@beda.software/remote-data';

export interface Props {
    task: Task;
}

export function useStatusHistoryModal(props: Props) {
    const { task } = props;

    const prepareChangesHistory = (tasks: Task[]) => {
        const historyReversed = tasks
            .map((t, index) => ({
                from: tasks[index + 1]?.businessStatus?.coding?.[0],
                to: t.businessStatus?.coding?.[0],
                dateTime: t.meta?.lastUpdated,
                id: `${t.id}-${t.meta?.versionId}`,
            }))
            .reverse();
        const historyFiltered = historyReversed
            .filter((t, index) => t.to?.code !== historyReversed[index - 1]?.to?.code)
            .reverse();
        const history: ChangesDiffChange[] = historyFiltered.map((t) => ({
            key: t.id,
            title: `Updated status ${formatHumanDateTime(t.dateTime)}`,
            valueBefore: t.from?.display ?? null,
            valueAfter: t.to?.display ?? null,
        }));

        return history;
    };

    const [response] = useService(async () => {
        return mapSuccess(
            await resolveMap({
                taskHistoryBundle: loadResourceHistory<Task>({
                    reference: `Task/${task.id}`,
                }),
            }),
            ({ taskHistoryBundle }) => {
                const taskHistory = extractBundleResources<Task>(taskHistoryBundle).Task;

                return {
                    changesHistory: prepareChangesHistory(taskHistory),
                };
            },
        );
    }, [task]);

    return { response };
}
