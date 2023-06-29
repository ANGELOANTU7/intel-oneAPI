import os
import boto3
from fastapi import APIRouter
import openai
import json

app = APIRouter()
s3_access_key = "AKIAZTHHIOR4JJ5HLTUB"
s3_secret_access_key = "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"
s3_bucket_name = "learnmateai"

s3 = boto3.client("s3", aws_access_key_id=s3_access_key, aws_secret_access_key=s3_secret_access_key)

# Set up OpenAI API credentials
openai.api_key = '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'

def processor( data,current_data, final_date):

    prompt = f'make a study plan of these topics:\n{data} \n\n current date:{current_data} \n final date:{final_date} \n\n the output should strictly be a json array of (Topic_name,date) , the date should be perfectly decided so that student can learn easily between the current date and final date, the repeat the topics based on their difficulty \n \n output should not contain anything expect the json, and it should not exceed 4000 token limit'
    response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
                            {
                    "role": "user",
                    "content": prompt
                }
    ]
    )
    summary = response.choices[0].message.content
    return summary

@app.get("/getdata")
async def makeplan(current_date: str,final_date: str):
    text=""
    bucket_name= "learnmateai"
    folder_name= "Analysed_Notes"
    try:
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=folder_name)
        for file in response['Contents']:
            file_key = file['Key']
            file_name = os.path.basename(file_key)
            file_name=file_name.split(".txt")[0]
            text=text+"\n"+file_name
            
            
        print(text)
        
        json_text=processor(text,current_date,final_date)    
        save_plan(json_text)
            # Parse the file content as JSON
        json_content = json.loads(json_text)

        # Return the JSON content
        return json_content
    except Exception as e:
        return {'error': str(e)}




def save_plan( summary: str):
    try:
        save_key = f'StudyPlan/plan.txt'
        s3.put_object(Body=summary, Bucket=s3_bucket_name, Key=save_key)
    except Exception as e:
        raise e
