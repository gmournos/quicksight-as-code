#!/bin/bash

opt=$1

template_id="$opt-template"
dashboard_id="$opt-dashboard"
dataset_id="$opt-dataset"
            
case $opt in
        "web")
            ds_placeholder="Web and Social Media Analytics"
            ;;
        "business")
            ds_placeholder="Business Review"
            ;;
        "sales")
            ds_placeholder="Sales Pipeline"
            ;;

        "people")
            ds_placeholder="People Overview"
            ;;
        *) 
            echo "invalid option."
            exit
            ;;
esac

echo selected dashboard ${dashboard_id}

if [ "$ACCOUNT" = "" ]; then
	echo " Login first !!!!"
	exit
fi

if [ "$AWS_REGION" = "" ]; then
	echo " Login first !!!!"
	exit
fi

startDir=$( pwd )
scriptDir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

echo cleaning up...............................................
rm -f "${scriptDir}/create-dashboard.json" "${scriptDir}/share-dashboard.json"
aws quicksight delete-dashboard --aws-account-id ${ACCOUNT} --dashboard-id "${dashboard_id}"
echo ...........................................clean up complete.
set -e

echo create dashboard..........................................
sed "s/__ACCOUNT__/${ACCOUNT}/g" "${scriptDir}/create-dashboard.BLUEPRINT.json" > "${scriptDir}/create-dashboard.json"
sed -i "s/__REGION__/${AWS_REGION}/g" "${scriptDir}/create-dashboard.json"
sed -i "s/__DATASET__/${dataset_id}/g" "${scriptDir}/create-dashboard.json"
sed -i "s/__DASHBOARD__/${dashboard_id}/g" "${scriptDir}/create-dashboard.json"
sed -i "s/__TEMPLATE__/${template_id}/g" "${scriptDir}/create-dashboard.json"
sed -i "s/__PLACEHOLDER__/${ds_placeholder}/g" "${scriptDir}/create-dashboard.json"
sed -i "s/__NAME__/${ds_placeholder}/g" "${scriptDir}/create-dashboard.json"


createDashboardJson=$(<"${scriptDir}/create-dashboard.json")
aws quicksight create-dashboard --cli-input-json "$createDashboardJson"
echo .......................................dashboard creation complete.

echo share dashboard............................................
sed "s/__ACCOUNT__/${ACCOUNT}/g" "${scriptDir}/share-dashboard.BLUEPRINT.json" > "${scriptDir}/share-dashboard.json"
sed -i "s/__REGION__/${AWS_REGION}/g" "${scriptDir}/share-dashboard.json"
sed -i "s/__DASHBOARD__/${dashboard_id}/g" "${scriptDir}/share-dashboard.json"

shareDashboardJson=$(<"${scriptDir}/share-dashboard.json")
aws quicksight update-dashboard-permissions --cli-input-json "${shareDashboardJson}"
echo .............................................dashboard shared.

rm -f "${scriptDir}/create-dashboard.json" "${scriptDir}/share-dashboard.json"
