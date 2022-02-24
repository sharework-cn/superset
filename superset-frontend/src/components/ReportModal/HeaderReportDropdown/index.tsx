/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useState, useEffect } from 'react';
import { usePrevious } from 'src/hooks/usePrevious';
import { useSelector, useDispatch } from 'react-redux';
import { t, SupersetTheme, css, useTheme } from '@superset-ui/core';
import Icons from 'src/components/Icons';
import { Switch } from 'src/components/Switch';
import { AlertObject } from 'src/views/CRUD/alert/types';
import { Menu, NoAnimationDropdown } from 'src/common/components';
import { isFeatureEnabled, FeatureFlag } from 'src/featureFlags';
import DeleteModal from 'src/components/DeleteModal';
import ReportModal from 'src/components/ReportModal';
import { ChartState } from 'src/explore/types';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';
import { fetchUISpecificReport } from 'src/reports/actions/reports';
import { reportSelector } from 'src/views/CRUD/hooks';
import { ReportType } from 'src/dashboard/util/constants';

const deleteColor = (theme: SupersetTheme) => css`
  color: ${theme.colors.error.base};
`;

export interface HeaderReportProps {
  toggleActive: (data: AlertObject, isActive: boolean) => void;
  deleteActiveReport: (data: AlertObject) => void;
  dashboardId?: number;
  chart?: ChartState;
}

export default function HeaderReportDropDown({
  toggleActive,
  deleteActiveReport,
  dashboardId,
  chart,
}: HeaderReportProps) {
  const dispatch = useDispatch();

  const report = useSelector<any, AlertObject>(state => {
    const resourceType = dashboardId
      ? ReportType.DASHBOARDS
      : ReportType.CHARTS;
    return reportSelector(state, resourceType, dashboardId || chart?.id);
  });
  const user: UserWithPermissionsAndRoles = useSelector<
    any,
    UserWithPermissionsAndRoles
  >(state => state.user || state.explore?.user);
  const [currentReportDeleting, setCurrentReportDeleting] =
    useState<AlertObject | null>(null);
  const theme = useTheme();
  const prevDashboard = usePrevious(dashboardId);
  const [showModal, setShowModal] = useState<boolean>(false);
  const toggleActiveKey = async (data: AlertObject, checked: boolean) => {
    if (data?.id) {
      toggleActive(data, checked);
    }
  };

  const handleReportDelete = (report: AlertObject) => {
    deleteActiveReport(report);
    setCurrentReportDeleting(null);
  };

  const canAddReports = () => {
    if (!isFeatureEnabled(FeatureFlag.ALERT_REPORTS)) {
      return false;
    }

    if (!user?.userId) {
      // this is in the case that there is an anonymous user.
      return false;
    }
    const roles = Object.keys(user.roles || []);
    const permissions = roles.map(key =>
      user.roles[key].filter(
        perms => perms[0] === 'menu_access' && perms[1] === 'Manage',
      ),
    );
    return permissions[0].length > 0;
  };
  const shouldFetch =
    canAddReports() &&
    !!((dashboardId && prevDashboard !== dashboardId) || chart?.id);

  useEffect(() => {
    if (shouldFetch) {
      dispatch(
        fetchUISpecificReport({
          userId: user.userId,
          filterField: dashboardId ? 'dashboard_id' : 'chart_id',
          creationMethod: dashboardId ? 'dashboards' : 'charts',
          resourceId: dashboardId || chart?.id,
        }),
      );
    }
  }, []);

  const menu = () => (
    <Menu selectable={false} css={{ width: '200px' }}>
      <Menu.Item>
        {t('Email reports active')}
        <Switch
          data-test="toggle-active"
          checked={report?.active}
          onClick={(checked: boolean) => toggleActiveKey(report, checked)}
          size="small"
          css={{ marginLeft: theme.gridUnit * 2 }}
        />
      </Menu.Item>
      <Menu.Item onClick={() => setShowModal(true)}>
        {t('Edit email report')}
      </Menu.Item>
      <Menu.Item
        onClick={() => setCurrentReportDeleting(report)}
        css={deleteColor}
      >
        {t('Delete email report')}
      </Menu.Item>
    </Menu>
  );
  return (
    <>
      {canAddReports() && (
        <>
          <ReportModal
            userId={user.userId}
            showModal={showModal}
            onHide={() => setShowModal(false)}
            userEmail={user.email}
            dashboardId={dashboardId}
            chart={chart}
          />
          {report ? (
            <>
              <NoAnimationDropdown
                overlay={menu()}
                trigger={['click']}
                getPopupContainer={(triggerNode: any) =>
                  triggerNode.closest('.action-button')
                }
              >
                <span role="button" className="action-button" tabIndex={0}>
                  <Icons.Calendar />
                </span>
              </NoAnimationDropdown>
              {currentReportDeleting && (
                <DeleteModal
                  description={t(
                    'This action will permanently delete %s.',
                    currentReportDeleting.name,
                  )}
                  onConfirm={() => {
                    if (currentReportDeleting) {
                      handleReportDelete(currentReportDeleting);
                    }
                  }}
                  onHide={() => setCurrentReportDeleting(null)}
                  open
                  title={t('Delete Report?')}
                />
              )}
            </>
          ) : (
            <span
              role="button"
              title={t('Schedule email report')}
              tabIndex={0}
              className="action-button"
              onClick={() => setShowModal(true)}
            >
              <Icons.Calendar />
            </span>
          )}
        </>
      )}
    </>
  );
}