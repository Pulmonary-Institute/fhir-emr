import classNames from 'classnames';

import { S, S1 } from './DashboardCard.styles';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    icon: React.ReactNode;
    extra?: React.ReactNode;
    empty?: boolean;
}

interface TableProps {
    title: string;
    data: any[];
    total?: number;
    columns: {
        title: string;
        key: string;
        render: (r: any) => React.ReactNode;
        width?: string | number;
    }[];
    getKey: (r: any) => string;
}

export function DashboardCard(props: Props) {
    const { title, icon, extra, children, className, empty = false } = props;

    return (
        <S.Wrapper>
            <S.Card
                className={classNames(className, {
                    _empty: empty,
                })}
            >
                <S.Header>
                    <div>
                        <S.Icon className={classNames({ _empty: empty })}>{icon}</S.Icon>
                        <S.Title>{title}</S.Title>
                    </div>
                    {extra && <div>{extra}</div>}
                </S.Header>
                {children && <S.Content>{children}</S.Content>}
            </S.Card>
        </S.Wrapper>
    );
}

export function DashboardCardVertical(props: Props) {
    const { title, icon, extra, children, className, empty = false } = props;

    return (
        <S1.Wrapper>
            <S1.Card
                className={classNames(className, {
                    _empty: empty,
                })}
            >
                <S1.Header>
                    <div>
                        <S.Icon className={classNames({ _empty: empty })}>{icon}</S.Icon>
                        <S.Title>{title}</S.Title>
                    </div>
                    {extra && <div>{extra}</div>}
                </S1.Header>
                {children && <S1.Content>{children}</S1.Content>}
            </S1.Card>
        </S1.Wrapper>
    );
}

export function DashboardCardTable(props: TableProps) {
    const { title, data, columns, getKey } = props;
    console.log('dashboard card table:', title);
    return (
        <div>
            <S.TableHeader>
                {columns.map((col) => (
                    <S.TableCell key={`header-${title}-${col.title}`} style={{ width: col.width, minWidth: col.width }}>
                        {col.title}
                    </S.TableCell>
                ))}
            </S.TableHeader>
            {data.map((item) => {
                const key = getKey(item);

                return (
                    <S.TableRow key={`row-${key}`}>
                        {columns.map((col) => (
                            <S.TableCell
                                key={`row-${key}-${col.title}`}
                                style={{ width: col.width, minWidth: col.width }}
                            >
                                {col.render(item)}
                            </S.TableCell>
                        ))}
                    </S.TableRow>
                );
            })}
        </div>
    );
}

export function DashboardCardTableVertical(props: TableProps) {
    const { title, data, columns, getKey } = props;
    console.log('dashboard card table:', title);
    return (
        <div>
            {data.map((item) => {
                const key = getKey(item);

                return (
                    <S1.TableRow key={`row-${key}`}>
                        {columns.map((col) => (
                            <S1.TableCell key={`row-${key}-${col.title}`}>
                                <S1.TableCellLabel>{col.title}</S1.TableCellLabel>
                                <S1.TableCellValue>{col.render(item)}</S1.TableCellValue>
                            </S1.TableCell>
                        ))}
                    </S1.TableRow>
                );
            })}
        </div>
    );
}
