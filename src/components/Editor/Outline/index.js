import React, { useState, useRef, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import { Outline } from '@itellyou/itellyou-editor';
import { findReadingSection } from './utils';
import styles from './index.less';
import { Card } from 'antd';

export default ({ view, config, ...props }) => {
    const lastScrollTop = useRef(0);
    const headings = useRef([]);

    const [contents, setContents] = useState([]);
    const [readingSection, setReadingSection] = useState(0);
    const [reachingTop, setReachingTop] = useState(true);

    useEffect(() => {
        if (view && config) {
            const contents =
                config && config.outline ? config.outline : Outline.extractFromDom(view);
            headings.current = contents.map(({ id }) => {
                return document.getElementById(id);
            });
            setContents(contents);
            listenerViewChange();
        }
    }, [listenerViewChange, view, config]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        listenerViewChange();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [handleScroll, listenerViewChange, handleResize]);

    useEffect(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 200);
    }, [contents]);

    const handleScroll = useCallback(() => {
        const min = 5;
        const top =
            window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;

        if (!Math.abs(lastScrollTop.current - top) <= min) {
            setReachingTop(top < 60);
            listenerViewChange();

            lastScrollTop.current = top;
        }
    }, []);

    const handleResize = useCallback(() => {
        listenerViewChange();
    }, []);

    const listenerViewChange = useCallback(() => {
        const index = findReadingSection(headings.current, 60);
        setReadingSection(index);
    }, []);
    if (!contents || contents.length === 0) return null;
    return (
        <div className={classNames(styles['toc'], { [styles['fixed']]: !reachingTop })} {...props}>
            <Card>
                <ul className={styles['directory']}>
                    {contents.map(({ id, text, level, depth }, index) => (
                        <li
                            key={id}
                            className={classNames(styles['item'], {
                                [styles['active']]: index === readingSection,
                            })}
                        >
                            <a
                                className={classNames(styles['link'], styles[`link-${depth}`])}
                                href={`#${id}`}
                            >
                                {text}
                            </a>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};
