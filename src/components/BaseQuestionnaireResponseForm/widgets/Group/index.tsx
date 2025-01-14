import classNames from 'classnames';
import _ from 'lodash';
import { useFormContext } from 'react-hook-form';
import { GroupItemProps, QuestionItems } from 'sdc-qrf';

import { Text } from 'src/components/Typography';

import { GroupContext, GroupContextProps } from './context';
import { GridGroup } from './GridGroup';
import s from './group.module.scss';
import { GTable } from './GTable';
import { RepeatableGroupRow, RepeatableGroups } from './RepeatableGroups';

function Flex(props: GroupItemProps & { type?: GroupContextProps['type'] }) {
    const { parentPath, questionItem, context, type = 'col' } = props;
    const { linkId, item, repeats, text, helpText, hidden } = questionItem;

    const methods = useFormContext();
    const existingItems = _.get(methods.getValues(), [...parentPath, questionItem.linkId, 'items']);
    const defaultValue = _.cloneDeep(existingItems[0] || {});

    if (hidden) {
        return null;
    }

    const renderRepeatableGroup = () => {
        if (type === 'gtable') {
            return <GTable groupItem={props} />;
        }

        if (type === 'row') {
            return (
                <RepeatableGroups
                    groupItem={props}
                    renderGroup={(p) => <RepeatableGroupRow {...p} />}
                    buildValue={() => [...existingItems, defaultValue]}
                />
            );
        }

        return <RepeatableGroups groupItem={props} buildValue={() => [...existingItems, defaultValue]} />;
    };

    if (type === 'grid') {
        return <GridGroup groupItem={props} />;
    }

    if (repeats) {
        return <GroupContext.Provider value={{ type }}>{renderRepeatableGroup()}</GroupContext.Provider>;
    }

    return (
        <div className={s.group}>
            {text || helpText ? (
                <div>
                    {text && <Text className={s.groupTitle}>{text}</Text>}
                    {helpText && <Text>{helpText}</Text>}
                </div>
            ) : null}
            {item && (
                <div
                    className={classNames({
                        [s.row as string]: type === 'row',
                        [s.col as string]: !type || type === 'col',
                    })}
                >
                    <QuestionItems
                        questionItems={item}
                        parentPath={[...parentPath, linkId, 'items']}
                        context={context[0]!}
                    />
                </div>
            )}
        </div>
    );
}

export function Group(props: GroupItemProps) {
    return <Flex {...props} />;
}

export function Col(props: GroupItemProps) {
    return <Flex {...props} type="col" />;
}

export function Row(props: GroupItemProps) {
    return <Flex {...props} type="row" />;
}

export function Gtable(props: GroupItemProps) {
    return <Flex {...props} type="gtable" />;
}

export function Grid(props: GroupItemProps) {
    return <Flex {...props} type="grid" />;
}
