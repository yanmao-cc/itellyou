import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, Link } from 'umi';
import { Table } from 'antd';
import Loading from '@/components/Loading';
import Timer from '@/components/Timer';
import { UserStar, UserAuthor } from '@/components/User';
import CardTable from '../components/CardTable';

export default () => {
    const [page, setPage] = useState(1);
    const limit = 20;

    const dispatch = useDispatch();
    const dataSource = useSelector(state => (state.userStar ? state.userStar.starList : null));
    const loadingEffect = useSelector(state => state.loading);
    const loading = loadingEffect.effects['userStar/starList'];

    useEffect(() => {
        dispatch({
            type: 'userStar/starList',
            payload: {
                offset: (page - 1) * limit,
                limit,
            },
        });
    }, [page, limit, dispatch]);

    const renderPage = (_, type, originalElement) => {
        if (type === 'prev') {
            return <a>上一页</a>;
        }
        if (type === 'next') {
            return <a>下一页</a>;
        }
        return originalElement;
    };

    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            render: (_, { star }) => {
                return <UserAuthor info={star} />;
            },
        },
        {
            title: '关注时间',
            dataIndex: 'created_time',
            key: 'created_time',
            width: 120,
            render: (text, { star: { use_star } }) => {
                if (use_star === false) return;
                return <Timer time={text} />;
            },
        },
        {
            title: '',
            dataIndex: 'action',
            key: 'action',
            width: 120,
            render: (_, { star: { id, use_star } }) => {
                use_star = use_star === undefined ? true : use_star;
                return <UserStar id={id} use_star={use_star} />;
            },
        },
    ];

    const renderTable = () => {
        if (!dataSource) return <Loading />;
        return (
            <Loading loading={loading}>
                <Table
                    rowKey={row => row.star.id}
                    columns={columns}
                    dataSource={dataSource.data}
                    pagination={{
                        onChange: page => {
                            setPage(page);
                        },
                        current: page,
                        itemRender: renderPage,
                        hideOnSinglePage: true,
                        pageSize: limit,
                        total: dataSource ? dataSource.total : 0,
                    }}
                />
            </Loading>
        );
    };

    return renderTable();
};
