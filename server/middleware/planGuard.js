const prisma= require('../prisma/client')

const requirePro = async (req,res,next)=>{
    try{
        const user=await prisma.user.findUnique({
            where: {id: req.userId},
            select: {plan:true}
        })

        if(!user || user.plan!=='pro'){
            return res.status(403).json({message:'This feature requires a Pro plan',
                upgrade: true
            })
            
        }

    }catch(err){
        next(err)
    }
    
}