#!/bin/bash

opt="$1"
scriptDir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

template_id="$opt-template"
analysis_id="$opt-analysis"
dataset_id="$opt-ds"

echo selected template ${template_id}

if [ "$ACCOUNT" = "" ]; then
	echo " Login first !!!!"
	exit
fi

if [ "$AWS_REGION" = "" ]; then
	echo " Login first !!!!"
	exit
fi

echo cleaning up...............................................
rm -f "${scriptDir}/create-template.json" "${scriptDir}/share-template.json"
aws quicksight delete-template --aws-account-id $ACCOUNT --template-id "${template_id}"
echo ...........................................clean up complete.
set -e

echo create template...........................................
sed "s/__ACCOUNT__/${ACCOUNT}/g" "${scriptDir}/create-template-${opt}.BLUEPRINT.json" > "${scriptDir}/create-template.json"
sed -i "s/__ANALYSIS__/${analysis_id}/g" "${scriptDir}/create-template.json"
sed -i "s/__TEMPLATE__/${template_id}/g" "${scriptDir}/create-template.json"
sed -i "s/__DATASET__/${dataset_id}/g" "${scriptDir}/create-template.json"
sed -i "s/__REGION__/${AWS_REGION}/g" "${scriptDir}/create-template.json"

createTemplateJson=$(<"${scriptDir}/create-template.json")

aws quicksight create-template --cli-input-json "${createTemplateJson}"

echo .......................................template creation complete.

aws quicksight describe-template-definition --template-id "${template_id}" --aws-account-id $ACCOUNT > "${scriptDir}/../../template-defs/${opt}-template-def.json"

grep -v Id\"  "${scriptDir}/../../template-defs/${opt}-template-def.json" > "${scriptDir}/../../template-defs/review/${opt}-template-def.json"

rm -f "${scriptDir}/create-template.json" "${scriptDir}/share-template.json"
