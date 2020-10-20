import { getAuctionById } from "./getAuction";
import { uploadPictureToS3 } from '../lib/uploadPictureToS3';
import createError from 'http-errors';
import middy from '@middy/core';
import validator from '@middy/validator';
import httpErrorHandler from "@middy/http-error-handler";
import { setAuctionPictureUrl} from '../lib/setAuctionPictureUrl';
import uploadAuctionPictureSchema from '../lib/schemas/uploadAuctionPictureSchema'

export async function uploadAuctionPicture(event){
    const { id } = event.pathParameters;
    const auction = await getAuctionById(id);
    const { email } = event.requestContext.authorizer;


    if(auction.seller !==email){
        throw new createError.Forbidden('You are not the owner of this auction!');
    }

    const base64 = event.body.replace(/ˆdata:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    
    let updatedAuction;

    try{
    const pictureUrl = uploadPictureToS3(auction.id + '.jpg', buffer);
     updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl);
    }catch(error){
        console.error(error);
        throw new createError.InternalServerError(error);
    }
    
    return{
        statusCode: 200,
        body: JSON.stringify(updatedAuction)
    }
}

export const handler = middy(uploadAuctionPicture)
    .use(httpErrorHandler())
    .use(validator({ inputSchema: uploadAuctionPictureSchema}));